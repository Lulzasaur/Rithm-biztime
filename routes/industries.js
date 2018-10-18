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
        let { industry } = req.body;

        const results = await db.query(
            `INSERT INTO industries (industry)
            VALUES ($1)
            RETURNING industry`,[industry]);
        
        let returnInd = {'industry':results.rows[0]}

        return res.json(returnInd)
    }

    catch(err){
        return next(err);
    }
})


//edit a industry
router.put('/:ind', async function(req,res,next){
    try{
        let { industry } = req.body,
            ind = req.params.ind;

        const results = await db.query(
            `UPDATE industries SET industry = $1
            WHERE industry = $2
            RETURNING industry`,[industry,ind]);

        if(results.rows[0]){
            let returnInd = {'industry':results.rows[0]}
            return res.json(returnInd)
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

//delete an industry
router.delete('/:ind', async function(req,res,next){
    try{
        let ind = req.params.ind

        const results = await db.query(
            `DELETE FROM industries WHERE industry = $1 RETURNING industry`,[ind]);
        
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