const http = require("http");
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 8000;
const bodyParser = require("body-parser");
const compression = require('compression');
const methodOverride = require('method-override');
const app = express();
// routes
const routes = require("./api/routes/resolverRoutes");
routes(app);

app.use(cors());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(
  express.urlencoded({
      extended: true,
  })
);
app.use(methodOverride());


const server = http.createServer(app);

app.use((err, res) => {
  res.json({
    error_code: err.error_code || err.message,
    error_message: err.message,
    error_data: err.error_data,
  });
});
server.listen(port, () => {
  console.log(`Listening on http://localhost${port}`);
});
