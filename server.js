const http = require("http"),
  express = require("express"),
  cors = require("cors"),
  compression = require("compression"),
  cookieParser = require("cookie-parser"),
  methodOverride = require("method-override"),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 8000;

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(compression());
app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({limit: '25mb', extended: true}));

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(methodOverride());

// SET UP SWAGGER API DOCUMENT
const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger/");
var swaggerOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "DID Resolver API",
  // customfavIcon: "/assets/favicon.ico"
};
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, swaggerOptions)
);

// ROUTE
const server = http.createServer(app);
const routes = require("./api/routes");
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
