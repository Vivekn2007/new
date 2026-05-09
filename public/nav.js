
let dropdown = document.querySelectorAll('#hdremove');
let sidebar = document.querySelector('#sidebar');
flag = true;
function slide(){
    sidebar.classList.toggle('hidden');
}

function drop(val){
    dropdown[val-1].classList.toggle('hidden');
}