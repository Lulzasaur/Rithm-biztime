/** BizTime express application. */
const express = require("express");
const app = express();
const companyRoutes = require('./routes/companies');
const invoiceRoutes = require('./routes/invoices');
const industryRoutes = require('./routes/industries');
const db = require('./db')

app.use(express.json());
app.use('/companies', companyRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/industries', industryRoutes);

app.post('/new-link', async function(req,res,next){
  try{
      let { ind_code, comp_code } = req.body;

      const results = await db.query(
          `INSERT INTO industry_company (comp_code,ind_code)
          VALUES ($1,$2)
          RETURNING comp_code,ind_code`,[comp_code,ind_code]);
      
      let returnLink = {'new-link':results.rows[0]}

      return res.json(returnLink)
  }

  catch(err){
      return next(err);
  }
})

/** 404 handler */
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
