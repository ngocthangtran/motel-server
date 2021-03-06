require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth.route');
const postRouter = require('./routes/post.route');
const uiRouter = require('./routes/ui.route');
const buildingRouter = require('./routes/building.router');
const roomRouter = require('./routes/room.router');
const suggestions = require('./routes/suggestions.router');
const service = require('./routes/services.router');
const contracts = require('./routes/contracts.route');
const renter = require('./routes/renter.router');
const manage = require('./routes/manage.route');
const userLogin = require('./routes/userLogin.routes');

const port = process.env.PORT || 7777;
const app = express();

const { sequelize } = require('./db');
const chalk = require('chalk');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
  const time = new Date();
  console.log(`(${time.getHours()}:${time.getMinutes()})) ${req.method}: ${req.url}`);
  next();
});

app.use('/user', userLogin)
app.use('/auth', authRouter);
app.use('/posts', postRouter);
app.use('/ui', uiRouter);
app.use('/building', buildingRouter);
app.use('/room', roomRouter);
app.use('/suggestions', suggestions);
app.use('/service', service);
app.use('/contract', contracts);
app.use('/renter', renter);
app.use('/manage', manage);


app.listen(port, async () => {
  console.log(chalk.green(`server running at port ${port}`));
  await sequelize.authenticate();
  console.log(chalk.green(`connected to database`));
  // await sequelize.sync({ alter: true, force: true });
  // await sequelize.sync({ alter: true });
  console.log(chalk.green(`models synced`));
});
