import { protectRoute } from "./auth.middleware.js";
import { processFiles, fileUploadMiddleware } from "./file.middleware.js";

export {protectRoute, processFiles,fileUploadMiddleware}