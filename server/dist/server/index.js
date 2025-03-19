"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const routes_1 = require("./routes");
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
// Register API routes
const server = (0, routes_1.registerRoutes)(app);
// Serve client assets in production
if (process.env.NODE_ENV === 'production') {
    const clientPath = path_1.default.join(process.cwd(), 'client/dist');
    if (fs_1.default.existsSync(clientPath)) {
        app.use(express_1.default.static(clientPath));
        app.get('*', (req, res) => {
            if (req.path.startsWith('/api/'))
                return;
            res.sendFile(path_1.default.join(clientPath, 'index.html'));
        });
        console.log(`Serving static files from ${clientPath}`);
    }
    else {
        console.warn(`Client build folder not found at ${clientPath}`);
    }
}
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
