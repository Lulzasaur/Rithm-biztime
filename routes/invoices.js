const express = require('express');
const router = new express.Router();
const db = require('../db')

//returns list of invoices
//
// => {invoices: [{code, name, description}, ... ]}

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

//edit a invoice: takes {amt, paid} in req, returns {...}
router.put('/:id', async function(req,res,next){
    try{
        let { amt, paid } = req.body, 
            paid_date,
            id = req.params['id']

        const paidOrNotRes = await db.query(
            `SELECT paid, paid_date FROM invoices WHERE id = $1`,[id]
        )

        const {currPaid, currPaidDate} = paidOrNotRes.rows[0];

        if(paid){
            if(!currPaid){
                paid_date = todayDate()
            } else{
                paid_date = currPaidDate
            }
        } else{
            paid_date = null
        }

        const results = await db.query(
            `UPDATE invoices SET amt = $1, paid = $2, paid_date = $3
            WHERE id = $4
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,[amt, paid, paid_date, id]);

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
        let id = req.params.id

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

//provides today's date for invoice paying

function todayDate(){
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1; //January is 0!
    let yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    today = mm + '/' + dd + '/' + yyyy;
    
    return today
    
}

module.exports = router;