"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const path_2 = require("path");
const routes_js_1 = require("./routes.js");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = (0, path_2.dirname)(__filename);
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3000');
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
const server = (0, routes_js_1.registerRoutes)(app);
if (process.env.NODE_ENV === 'production') {
    app.use(express_1.default.static(path_1.default.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../client/build/index.html'));
    });
}
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
