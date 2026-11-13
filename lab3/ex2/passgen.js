const minLen = document.getElementById('minLen');
const maxLen = document.getElementById('maxLen');
const upperCase = document.getElementById('upperCase');
const special = document.getElementById('special');
const genBtn = document.getElementById('gen');


function generatePassword(minLen,maxLen,upperCase,special) {
    let length = Math.floor(Math.random()*(maxLen-minLen+1)+minLen);
    let charset = "abcdefghijklmnopqrstuvwxyz";
    if (upperCase) {
        charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    if(special){
        charset += "0123456789!@#$%^&*()";
    }
    
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

genBtn.addEventListener('click',()=>{
    pass = generatePassword(minLen.value);

})
