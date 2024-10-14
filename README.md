# 工作日历应用

这是一个基于 Next.js 开发的工作日历应用，支持日程管理、周报和月报生成，以及暗黑模式切换。

## 功能特点

- 日历视图：查看和管理每日工作项目
- 实时时钟：显示当前时间
- 任务管理：添加、完成和删除工作项目
- 自动报告：生成周报和月报
- 暗黑模式：支持明暗主题切换
- 实时同步：使用 WebSocket 实现多设备数据同步

## 本地部署步骤

1. 克隆仓库：
   ```
   git clone https://github.com/feisha20/WorkCalendar.git
   cd WorkCalendar
   ```

2. 安装依赖：
   ```
   npm install
   ```

3. 创建 `.env.local` 文件，添加以下环境变量：
   ```
   KV_URL=your_kv_database_url
   KV_REST_API_URL=your_kv_rest_api_url
   KV_REST_API_TOKEN=your_kv_rest_api_token
   KV_REST_API_READ_ONLY_TOKEN=your_kv_read_only_token
   ```

4. 运行开发服务器：
   ```
   npm run dev
   ```

5. 在浏览器中访问 `http://localhost:3000`

## Vercel 一键部署

1. 点击下面的按钮一键部署到 Vercel：

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/feisha20/WorkCalendar)

2. 在 Vercel 部署过程中，你需要配置以下环境变量：
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

## KV 数据库配置

本项目使用 Vercel KV 作为数据存储。以下是配置步骤：

1. 在 Vercel 控制台中，进入你的项目。

2. 点击 "Storage" 选项卡。

3. 选择 "Create Database" 并选择 "KV"。

4. 按照提示完成数据库创建。

5. 创建完成后，你会看到连接信息。复制这些信息并添加到你的环境变量中。

6. 在项目设置中的 "Environment Variables" 部分，添加以下变量：
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

7. 重新部署你的应用以使用新的 KV 数据库。

## 技术栈

- Next.js
- React
- TypeScript
- Tailwind CSS
- Socket.IO
- Vercel KV

## 贡献

欢迎提交 Pull Requests 来改进这个项目。对于重大更改，请先开一个 issue 讨论你想要改变的内容。

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)
