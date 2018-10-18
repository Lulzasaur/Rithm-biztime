const express = require('express');
const slugify = require('slugify');
const router = new express.Router();
const db = require('../db')

//returns list of industries
router.get('/', async function(req, res, next){
    try{
        const results = await db.query(
            'SELECT industry FROM industries');
        
        let indList = {industries:results.rows}

        return res.json(indList)
    }

    catch(err){
        return next(err);
    }
})

//select specific industry
router.get('/:ind', async function(req, res, next) {
    try{
        ind = req.params.ind
        const results = await db.query(
            'SELECT id,industry FROM industries WHERE industry = $1',[ind]);
        
        const industryResults = await db.query(
            `SELECT companies.name FROM companies
            JOIN industry_company ON industry_company.comp_code = companies.code
            JOIN industries ON industries.id = industry_company.ind_code
            WHERE industries.industry = $1`,[ind]);

            
        if(results.rows[0]){

            let returnInd = {industry:results.rows[0]}
            returnInd.companies = industryResults.rows
            return res.json(returnInd)

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

//create an industry
router.post('/', async function(req,res,next){
    try{
        let { name, description } = req.body;

        let code = slugify(name,{lower:true});

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