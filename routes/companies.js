const express = require('express');
const slugify = require('slugify');
const router = new express.Router();
const db = require('../db')

//returns list of companies
router.get('/', async function(req, res, next){
    try{
        const results = await db.query(
            'SELECT code,name FROM companies');
        
        let compList = {companies:results.rows}

        return res.json(compList)
    }

    catch(err){
        return next(err);
    }
})

//select specific company
router.get('/:code', async function(req, res, next) {
    try{
        code = req.params['code']
        const results = await db.query(
            'SELECT code, name, description FROM companies WHERE code = $1',[code]);
        
        const invoiceResults = await db.query(
            'SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices WHERE comp_code = $1',[code]);
        
        if(results.rows[0]){

            let returnComp = {company:results.rows[0]}
            returnComp.invoices = invoiceResults.rows
            return res.json(returnComp)

        } else {
            // res = Company.query.get_or_404
            let err = new Error('Company Not Found')
            err.status = 404;
            throw err;
        }
    }

    catch(err){    
        return next(err);
    }
})

//create a company
router.post('/', async function(req,res,next){
    try{
        let { code, name, description } = req.body;

        const results = await db.query(
            `INSERT INTO companies (code,name,description)
            VALUES ($1, $2, $3)
            RETURNING code,name,description`,[code,name,description]);
        
        let returnComp = {'company':results.rows[0]}

        return res.json(returnComp)
    }

    catch(err){
        return next(err);
    }
})

//edit a company
router.put('/:code', async function(req,res,next){
    try{
        let { name, description } = req.body,
            code = req.params['code']

        const results = await db.query(
            `UPDATE companies SET name = $1, description = $2
            WHERE code = $3
            RETURNING code,name,description`,[name,description,code]);

        if(results.rows[0]){
            let returnComp = {'company':results.rows[0]}
            return res.json(returnComp)
        } else{
            // res = Company.query.get_or_404
            let err = new Error('Company Not Found')
            err.status = 404;
            throw err;
        }
    }

    catch(err){
        return next(err);
    }
})

//delete a company
router.delete('/:code', async function(req,res,next){
    try{
        let code = req.params['code']

        const results = await db.query(
            `DELETE FROM companies WHERE code = $1 RETURNING code, name`,[code]);
        
        if(results.rows[0]){

            let status = {status:'deleted'}
            return res.json(status)
        } else{
            // res = Company.query.get_or_404
            let err = new Error('Company Not Found')
            err.status = 404;
            throw err;
        }
    }
    catch(err){
        return next(err);
    }
})

module.exports = router;