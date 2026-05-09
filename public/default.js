let divs = document.querySelectorAll('#b1');
let showBut = document.querySelector('#Serch');
function updateSelection(){
    let radioB = document.querySelectorAll('input[type="radio"]');
    radioB.forEach((but)=>{
        if(but.checked){
            
            divs[parseInt(but.value)].classList.remove('hidden');
            divs[parseInt(but.value)].classList.remove('not-md:hidden');
        }
    })
}
showBut.addEventListener('click',updateSelection);