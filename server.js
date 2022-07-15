const http = require("http"),
  express = require("express"),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  compression = require("compression"),
<<<<<<< HEAD
  cookieParser = require("cookie-parser"),
  methodOverride = require("method-override"),
  swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger/"),
  port = process.env.PORT || 8000;
=======
  cookieParser = require('cookie-parser'),
  methodOverride = require("method-override"),
  port = process.env.PORT || 8000;

const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger/");
>>>>>>> bce7091 (refactor swagger)

const app = express();

// routes
const routes = require("./api/routes/resolverRoutes");
app.use(cors());
app.use(cookieParser());
app.use(compression());
app.use(express.json());
app.use((err, req, res, _next) => {
  res.json({
    error_message: "Body should be a JSON",
  });
});

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(methodOverride());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const server = http.createServer(app);
routes(app);
app.use((err, res) => {
  res.json({
    error_code: err.error_code || err.message,
    error_message: err.message,
    error_data: err.error_data,
  });
});

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
