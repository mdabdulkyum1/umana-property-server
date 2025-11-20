import cors from "cors";
import express, { Application, Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import morgan from "morgan";
import globalErrorHandler from "./app/errors/globalErrorHandler";
import router from "./app/routes";


const app: Application = express();

const authOptions = {
  origin: [
    "http://localhost:3000",            
    "https://umana-property.vercel.app",    
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(
  cors(authOptions)
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get("/", (req: Request, res: Response) => {
  res.send({ Message: "Umana Property server is running. . ." });
});

app.use(morgan("dev"));

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use((req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;