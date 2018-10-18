const express = require('express');
const router = new express.Router();
const db = require('../db')

//returns list of invoices
router.get('/', async function(req, res, next){
    try{
        const results = await db.query(
            'SELECT id,comp_code FROM invoices');
        
        let invoiceList = {invoices:results.rows}

        return res.json(invoiceList)
    }

    catch(err){
        return next(err);
    }
})

//select specific invoice
router.get('/:id', async function(req, res, next) {
    try{
        id = req.params['id']
        const results = await db.query(
            'SELECT id, amt, paid, add_date, paid_date, comp_code FROM invoices WHERE id = $1',[id]);
        
        const companyResults = await db.query(
            'SELECT code, name, description FROM companies WHERE code = $1',[results.rows[0].comp_code]);
    
            
        if(results.rows[0]){

            let returnInvoice = {invoice:results.rows[0]};
            returnInvoice.company = companyResults.rows[0];
            return res.json(returnInvoice);

        } else {
            // res = Company.query.get_or_404
            let err = new Error('Invoice Not Found')
            err.status = 404;
            throw err;
        }
    }

    catch(err){    
        return next(err);
    }
})

//create an invoice
router.post('/', async function(req,res,next){
    try{
        let { comp_code, amt } = req.body;

        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,[comp_code, amt]);
        
        let returnInvoice = {'invoice':results.rows[0]}

        return res.json(returnInvoice)
    }

    catch(err){
        return next(err);
    }
})

//edit a invoice
router.put('/:id', async function(req,res,next){
    try{
        let { amt } = req.body,
            id = req.params['id']

        const results = await db.query(
            `UPDATE invoices SET amt = $1
            WHERE id = $2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,[amt,id]);

        if(results.rows[0]){
            let returnInvoice = {'invoice':results.rows[0]}
            return res.json(returnInvoice)
        } else{
            // res = Company.query.get_or_404
            let err = new Error('Invoice Not Found')
            err.status = 404;
            throw err;
        }
    }

    catch(err){
        return next(err);
    }
})

//delete a company
router.delete('/:id', async function(req,res,next){
    try{
        let id = req.params['id']

        const results = await db.query(
            `DELETE FROM invoices WHERE id = $1 RETURNING id`,[id]);
        
        if(results.rows[0]){

            let status = {status:'deleted'}
            return res.json(status)
        } else{
            let err = new Error('Invoice Not Found')
            err.status = 404;
            throw err;
        }
    }
    catch(err){
        return next(err);
    }
})

module.exports = router;