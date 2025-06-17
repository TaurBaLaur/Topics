
const express = require('express');
const fs = require('fs');
const path = require("path");

const app =express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));


const hostname = 'localhost';
const port = 5050;

app.listen(port,()=>{
    console.log(`Server running at http://${hostname}:${port}/2much2know`);
});

app.get('/',(req,res)=>{
    res.redirect('/2much2know')
});

app.get('/2much2know',(req,res)=>{
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/topics',(req,res)=>{
    try {
        const topics = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/topics.json'), 'utf8'));
        res.status(200).send({ topics: topics });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error occurred while reading data' });
    }
});

app.post('/topics',(req,res)=>{
    try {
        const newTopic = req.body;
        const topics = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/topics.json'), 'utf8'));
        topics.push(newTopic);
        fs.writeFileSync(path.join(__dirname, '../db/topics.json'), JSON.stringify(topics,null,4));
        res.status(200).send({ message: 'Topic added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error occurred while inserting data' });
    }
});

app.delete('/topics/:topicTitle',(req,res)=>{
    try {
        const topic = req.params['topicTitle'];

        const topics = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/topics.json'), 'utf8'));
        const sections = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/sections.json'), 'utf8'));

        const remainingSections = sections.filter(section => section.topic !== topic);
        fs.writeFileSync(path.join(__dirname, '../db/sections.json'), JSON.stringify(remainingSections,null,4));

        const remainingTopics = topics.filter(top => top.title !== topic);
        fs.writeFileSync(path.join(__dirname, '../db/topics.json'), JSON.stringify(remainingTopics,null,4));

        res.status(200).send({ message: 'Topic deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error occurred while deleting data' });
    }
});

app.get('/topics/:topicTitle/sections',(req,res)=>{
    try {
        const topic = req.params['topicTitle'];
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/sections.json'), 'utf8'));
        const sections = data.filter(d => d.topic===topic);

        res.status(200).send({ sections: sections });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error occurred while reading data' });
    }
});

app.post('/topics/:topicTitle/sections',(req,res)=>{
    try {
        const newSection = req.body;
        newSection.topic = req.params['topicTitle'];
        const sections = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/sections.json'), 'utf8'));
        sections.push(newSection);
        fs.writeFileSync(path.join(__dirname, '../db/sections.json'), JSON.stringify(sections,null,4));
        res.status(200).send({ message: 'Section added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error occurred while inserting data' });
    }
});

app.delete('/topics/:topicTitle/sections/:sectionSummary',(req,res)=>{
    try {
        const topic = req.params['topicTitle'];
        const sectionSummary = req.params['sectionSummary'];

        const sections = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/sections.json'), 'utf8'));

        const remainingSections = sections.filter(section => section.topic !== topic || section.summary!==sectionSummary);
        fs.writeFileSync(path.join(__dirname, '../db/sections.json'), JSON.stringify(remainingSections,null,4));

        res.status(200).send({ message: 'Section deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error occurred while deleting data' });
    }
});