const express = require('express');
const app = express();

app.get('/show-keys', (req, res)=>{
    console.log('key delivered');
    res.status(200).send("8ad754035bb77370dd86988afd9045bc0991624806f2598f259bc4fe5207c6cf");	
    //res.status(200).send("5e00da209def84dbbe55566afe65a00d4e8408e4a2cc8a94a66dc47d54f52ccc");  
});

app.listen(3000, () => {
    console.log("Vault Test");
});
