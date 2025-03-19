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
// Node.js path resolution for CommonJS compatibility
const __dirname = process.cwd();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3000');
console.log(`Starting server on port ${PORT}`);
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
const server = (0, routes_1.registerRoutes)(app);
// Serve client assets in production
if (process.env.NODE_ENV === 'production') {
    // Client folder could be different in production vs. development
    const clientPath = path_1.default.join(__dirname, 'client/dist');
    const clientPathAlt = path_1.default.join(__dirname, 'client/build');
    // Check if client/dist exists, otherwise try client/build
    const clientFolder = fs_1.default.existsSync(clientPath) ? clientPath :
        (fs_1.default.existsSync(clientPathAlt) ? clientPathAlt : null);
    if (clientFolder) {
        app.use(express_1.default.static(clientFolder));
        app.get('*', (req, res) => {
            // Skip API routes
            if (req.path.startsWith('/api/')) {
                return;
            }
            res.sendFile(path_1.default.join(clientFolder, 'index.html'));
        });
        console.log(`Serving static files from ${clientFolder}`);
    }
    else {
        console.warn('Client build folder not found. Static files will not be served.');
    }
}
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
