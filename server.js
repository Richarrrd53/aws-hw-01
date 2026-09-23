const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
const hostname = '127.0.0.1';
const fs = require("fs");
const { marked } = require('marked');
require("dotenv").config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// 預設 18 個章節標題
const defaultTitles = {
    1: "何謂憑證、HTTP、HTTPS、Port",
    2: "inbound/outbound 防火牆是什麼",
    3: "CIDR（Classless Inter-Domain Routing，無類別域間路由）",
    4: "DNS、IP、Domain 與 URL",
    5: "完整拆解一個URL"
};

// 若 chapters 資料庫為空，自動從 txt 初始化資料
async function initDb() {
    try {
        const res = await pool.query('SELECT COUNT(*) FROM chapters');
        const count = parseInt(res.rows[0].count, 10);
        if (count === 0) {
            console.log('檢測到 chapters 資料表為空，正在匯入初始 5 個章節資料...');
            for (let i = 1; i <= 5; i++) {
                const textFileDir = path.join(__dirname, "public/data/ch" + i + ".txt");
                let content = "";
                if (fs.existsSync(textFileDir)) {
                    content = fs.readFileSync(textFileDir, "utf-8");
                }
                const title = defaultTitles[i] || `Chapter ${i}`;
                await pool.query(
                    `INSERT INTO chapters (chapter_number, title, content)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (chapter_number) DO NOTHING`,
                    [i, title, content]
                );
            }
            console.log('章節資料表初始匯入完成！');
        }
    } catch (err) {
        console.error('初始化 chapters 資料表失敗:', err);
    }
}
initDb();

// 中介軟體
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 頁面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get(['/admin', '/auth'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get("/get-islocalhost", (req, res) => {
    res.send("islocalhost");
});

// 前台取得解析後的 Markdown HTML 內容
app.get("/get-content/:ch", async (req, res) => {
    try {
        const chNum = parseInt(req.params.ch, 10);
        if (isNaN(chNum)) {
            return res.status(400).send('缺少或無效的章節編號');
        }

        const result = await pool.query(
            `SELECT title, content FROM chapters WHERE chapter_number = $1`,
            [chNum]
        );

        if (result.rows.length === 0) {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.send('<h3>此章節已刪除</h3><p>該章節已被管理員刪除，目前無法查看內容。</p>');
        }

        const markdownText = result.rows[0].content || '';
        const html = marked.parse(markdownText);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(html);
    } catch (error) {
        console.error('讀取章節內容失敗:', error);
        res.status(500).send("資料庫讀取失敗");
    }
});

// API: 取得所有章節資訊
app.get("/api/chapters", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, chapter_number, title, content, updated_at FROM chapters ORDER BY chapter_number ASC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('取得章節清單失敗:', error);
        res.status(500).json({ error: '取得章節清單失敗' });
    }
});

// API: 取得單一章節資訊
app.get("/api/chapters/:ch", async (req, res) => {
    try {
        const chNum = parseInt(req.params.ch, 10);
        if (isNaN(chNum)) {
            return res.status(400).json({ error: '無效的章節編號' });
        }
        const result = await pool.query(
            `SELECT id, chapter_number, title, content, updated_at FROM chapters WHERE chapter_number = $1`,
            [chNum]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到該章節' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('取得章節失敗:', error);
        res.status(500).json({ error: '取得章節失敗' });
    }
});

// API: 更新章節 (UPDATE chapters)
const updateChapterHandler = async (req, res) => {
    try {
        const chNum = parseInt(req.params.ch, 10);
        if (isNaN(chNum)) {
            return res.status(400).json({ error: '無效的章節編號' });
        }

        const { title, content } = req.body;
        if (title === undefined || content === undefined) {
            return res.status(400).json({ error: '請提供 title 與 content' });
        }

        const result = await pool.query(
            `UPDATE chapters
             SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
             WHERE chapter_number = $3
             RETURNING id, chapter_number, title, content, updated_at`,
            [title, content, chNum]
        );

        if (result.rows.length === 0) {
            const insertResult = await pool.query(
                `INSERT INTO chapters (chapter_number, title, content, updated_at)
                 VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                 RETURNING id, chapter_number, title, content, updated_at`,
                [chNum, title, content]
            );
            return res.json({ success: true, chapter: insertResult.rows[0] });
        }

        res.json({ success: true, chapter: result.rows[0] });
    } catch (error) {
        console.error('更新章節失敗:', error);
        res.status(500).json({ error: '更新章節失敗: ' + error.message });
    }
};

app.put("/api/chapters/:ch", updateChapterHandler);
app.post("/api/chapters/:ch", updateChapterHandler);

// API: 刪除章節 (DELETE chapters)
app.delete("/api/chapters/:ch", async (req, res) => {
    try {
        const chNum = parseInt(req.params.ch, 10);
        if (isNaN(chNum)) {
            return res.status(400).json({ error: '無效的章節編號' });
        }

        const result = await pool.query(
            `DELETE FROM chapters WHERE chapter_number = $1 RETURNING id, chapter_number, title`,
            [chNum]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到該章節或該章節已遭刪除' });
        }

        res.json({
            success: true,
            message: `Chapter ${chNum} 刪除成功`,
            deletedChapter: result.rows[0]
        });
    } catch (error) {
        console.error('刪除章節失敗:', error);
        res.status(500).json({ error: '刪除章節失敗: ' + error.message });
    }
});

app.listen(port, () => {
    console.log(`伺服器運行在 http://${hostname}:${port}`);
});