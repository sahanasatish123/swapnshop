const apicall=(time)=>{
    return new Promise((resolve,reject)=>{
        if(true){
            resolve("this is api")
        }
        else{
            reject('error')
        }
    });
}
apicall(1000).then(()=>{
    console.log("hey")
})
