const express = require('express');

const app = express();

app.get('/courses', (request, response) => {
    return response.json({courses: ['course1', 'course2', 'course3']});
})

app.listen(3333, () => {
    console.log('no ar') 
});