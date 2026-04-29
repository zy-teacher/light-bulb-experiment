const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 配置跨域（允许平板/不同设备访问）
app.use(cors());
// 解析JSON请求体
app.use(express.json({ limit: '50mb' })); // 允许大图片base64传输
// 静态文件托管（前端页面）
app.use(express.static(path.join(__dirname, 'public')));

// 数据存储路径
const DATA_FILE = path.join(__dirname, 'data', 'reports.json');

// 初始化数据文件
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
}

// 读取所有报告单
function readReports() {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// 写入报告单
function writeReports(reports) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), 'utf8');
}

// 1. 提交报告单接口
app.post('/api/submit-report', (req, res) => {
    try {
        const report = req.body;
        if (!report.studentId || !report.className || !report.imageData) {
            return res.json({ success: false, message: '缺少必填字段' });
        }

        const reports = readReports();
        // 检查是否已提交过，允许覆盖
        const existingIndex = reports.findIndex(r => r.studentId === report.studentId);
        if (existingIndex > -1) {
            // 【新增】如果学生重新提交，保留原有的点赞数
            report.likes = reports[existingIndex].likes || 0;
            reports[existingIndex] = report;
        } else {
            report.likes = 0; // 【新增】新提交的报告单初始点赞为 0
            reports.push(report);
        }

        writeReports(reports);
        res.json({ success: true, message: '提交成功' });
    } catch (error) {
        console.error('提交失败：', error);
        res.json({ success: false, message: '服务器错误' });
    }
});

// 2. 获取所有报告单接口 (简化版，供教师端列表使用)
app.get('/api/get-all-reports', (req, res) => {
    try {
        const reports = readReports();
        const simplifiedReports = reports.map(r => ({
            id: r.id,
            studentId: r.studentId,
            studentName: r.studentName,
            className: r.className,
            groupName: r.groupName,
            submitTime: r.submitTime,
            result: r.result,
            likes: r.likes || 0
        }));
        res.json({ success: true, data: simplifiedReports });
    } catch (error) {
        console.error('获取失败：', error);
        res.json({ success: false, message: '服务器错误' });
    }
});

// 3. 根据ID获取单个报告单（含图片）
app.get('/api/get-report-by-id/:id', (req, res) => {
    try {
        const reportId = req.params.id;
        const reports = readReports();
        const report = reports.find(r => r.id === reportId);
        if (report) {
            res.json({ success: true, data: report });
        } else {
            res.json({ success: false, message: '未找到该报告单' });
        }
    } catch (error) {
        console.error('获取失败：', error);
        res.json({ success: false, message: '服务器错误' });
    }
});

// 4. 根据学号搜索报告单
app.get('/api/search-report/:studentId', (req, res) => {
    try {
        const studentId = req.params.studentId;
        const reports = readReports();
        const matchedReports = reports.filter(r => r.studentId.includes(studentId));
        const simplifiedReports = matchedReports.map(r => ({
            id: r.id,
            studentId: r.studentId,
            studentName: r.studentName,
            className: r.className,
            groupName: r.groupName,
            submitTime: r.submitTime,
            result: r.result,
            likes: r.likes || 0
        }));
        res.json({ success: true, data: simplifiedReports });
    } catch (error) {
        console.error('搜索失败：', error);
        res.json({ success: false, message: '服务器错误' });
    }
});

// 5. 【新增】获取所有带图片的完整报告单（用于学生端班级汇总互评）
app.get('/api/get-all-reports-full', (req, res) => {
    try {
        const reports = readReports();
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error('获取汇总失败：', error);
        res.json({ success: false, message: '服务器错误' });
    }
});

// 6. 【新增】点赞接口
app.post('/api/like-report/:id', (req, res) => {
    try {
        const reportId = req.params.id;
        const reports = readReports();
        const reportIndex = reports.findIndex(r => r.id === reportId);
        
        if (reportIndex > -1) {
            reports[reportIndex].likes = (reports[reportIndex].likes || 0) + 1;
            writeReports(reports);
            res.json({ success: true, likes: reports[reportIndex].likes });
        } else {
            res.json({ success: false, message: '未找到该报告单' });
        }
    } catch (error) {
        console.error('点赞失败：', error);
        res.json({ success: false, message: '服务器错误' });
    }
});

// 7. 【新增】教师点评接口
app.post('/api/comment-report/:id', (req, res) => {
    try {
        const reportId = req.params.id;
        const { comment } = req.body;
        const reports = readReports();
        const reportIndex = reports.findIndex(r => r.id === reportId);
        
        if (reportIndex > -1) {
            reports[reportIndex].comment = comment; // 写入点评内容
            writeReports(reports);
            res.json({ success: true, message: '点评成功' });
        } else {
            res.json({ success: false, message: '未找到该报告单' });
        }
    } catch (error) {
        console.error('点评失败：', error);
        res.json({ success: false, message: '服务器错误' });
    }
});

// 8. 【新增】删除报告单接口
app.delete('/api/delete-report/:id', (req, res) => {
    try {
        const reportId = req.params.id;
        let reports = readReports();
        const initialLength = reports.length;
        
        // 过滤掉需要删除的报告单
        reports = reports.filter(r => r.id !== reportId);
        
        if (reports.length < initialLength) {
            writeReports(reports);
            res.json({ success: true, message: '删除成功' });
        } else {
            res.json({ success: false, message: '未找到该报告单' });
        }
    } catch (error) {
        console.error('删除失败：', error);
        res.json({ success: false, message: '服务器错误' });
    }
});


app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.json({ success: false, message: '问题不能为空' });

        // ==========================================
        // ⚠️ 请在这里填入你申请的 API Key
        // ==========================================
        const API_KEY = 'sk-820235bbddfa4fb4a690bc653deab4f9'; // 替换为你的 DeepSeek 或 豆包 API Key
        
        // DeepSeek 配置：
        const API_URL = 'https://api.deepseek.com/chat/completions';
        const MODEL_NAME = 'deepseek-chat';

        /*
        // 豆包 (Volcengine) 配置示例 (如需使用豆包，取消这里的注释并注释掉上面的DeepSeek配置)：
        // const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
        // const MODEL_NAME = 'ep-YOUR_ENDPOINT_ID'; // 豆包需要填入你的接入点 ID (Endpoint ID)
        */

        // 向 AI 发送请求
        const aiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    { 
                        role: 'system', 
                        content: '你是一个得力的小学科学老师助手。现在学生正在做一个叫《点亮小灯泡》的虚拟实验（使用电池、导线、小灯泡）。请你用非常亲切、生动、易懂且充满鼓励的语言回答学生关于电路、科学原理的操作问题。每次回答尽量简短精炼。' 
                    },
                    { role: 'user', content: message }
                ],
                temperature: 0.7
            })
        });

        const data = await aiResponse.json();

        // 解析并返回 AI 的回答
        if (data.choices && data.choices.length > 0) {
            res.json({ success: true, reply: data.choices[0].message.content });
        } else {
            console.error("AI 接口返回异常：", data);
            res.json({ success: false, message: 'AI 大脑暂时短路了，请稍后再试' });
        }

    } catch (error) {
        console.error('智慧问答请求失败：', error);
        res.json({ success: false, message: '网络请求错误，请检查服务器网络或 API 密钥配置' });
    }
});


// 启动服务
app.listen(PORT, () => {
    console.log(`服务器已启动：http://localhost:${PORT}`);
    console.log(`学生端页面：http://localhost:${PORT}/experiment.html`);
    console.log(`后台管理页面：http://localhost:${PORT}/admin.html`);
});

