let selectbox = document.querySelector('select');
let divs = document.querySelectorAll('#inputs');
let inp = document.querySelectorAll('input');
let Upinp = document.querySelectorAll('.up');
let tbod = document.querySelector('tbody');
let delBut = document.querySelector('#del');
let div = document.querySelector('.tab');
let searchBut = document.querySelector('#sear');
let ShowBut = document.querySelector('#Ser');

function updateSelection(){
    let radioB = document.querySelectorAll('input[type="radio"]');
    console.log('hello');
    radioB.forEach((but)=>{
        if(but.checked){
            
            divs[4+parseInt(but.value)].classList.remove('hidden');
            divs[4+parseInt(but.value)].classList.remove('not-md:hidden');
        }
    })
}
async function getFileData(fileInput) {
  return new Promise((resolve, reject) => {
    const file = fileInput.files[0];
    if (!file) return resolve(null);

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      resolve({ data: base64String, contentType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function sendApi() {
  let array = {};
  let ar = [];

  // collect checked checkboxes
  let checkb = document.querySelectorAll('input[type="checkbox"]');
  for (let box of checkb) {
    if (box.checked && box.value !== "${id}") {
      ar.push(box.value);
    }
  }
  array['id'] = ar;

  // collect radio selection
  let radioB = document.querySelectorAll('input[type="radio"]');
  for (let but of radioB) {
    if (but.checked) {
      let val = parseInt(but.value);
      let id = Upinp[val].getAttribute("id");

      if (val === 4) {
        // Photo
        const fileData = await getFileData(document.getElementById('img'));
        if (fileData) array[id] = fileData;
      } else {
        array[id] = Upinp[val].value;
      }
    }
  }

  console.log(array);

  let res = await fetch('/update-item', {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(array)
  });
}


function selection() {
    let checkb = document.querySelectorAll('input[type="checkbox"]');
    if (checkb[0].checked) {
        checkb.forEach((box) => {
            console.log('tr');
            box.checked = true;
        })
    } else {
        checkb.forEach((box) => {

            box.checked = false;
        })
    }
}



async function api() {
    let resp = await fetch('/session-storage');
    let data = await resp.json();
    try {
        let obj = data['par'][0]["data"];
        console.log(data['par'][0]);
        for (let dat in obj) {

            let ele = obj[dat];

            table(ele["id"], ele["name"], ele["parent"], ele["class"], ele["from"], ele["to"], ele["fee"]);
        }
    } catch {
        console.log('No data'); 
    }

}
function table(id, name, parent, clas, from, to, fee) {
    let newTag = document.createElement('tr');
    newTag.innerHTML = `
                            <td class="border-2 w-6 not-md:w-5"><input type="checkbox" value="${id}"></td>
                            <td class="border-2 w-8 not-md:w-4">${id}</td>
                            <td class="border-2 w-70 not-md:w-15">${name}</td>
                            <td class="border-2 w-70 not-md:w-15">${parent}</td>
                            <td class="border-2 w-20 not-md:w-1">${clas}</td>
                            <td class="border-2 w-70 not-md:w-15">${from}</td>
                            <td class="border-2 w-70 not-md:w-15">${to}</td>
                            <td class="border-2 w-30 not-md:w-1">${fee}</td>
                       `;
    tbod.append(newTag);


}
function showInput() {
    let key = selectbox.value;
    console.log(inp[parseInt(key)].name);
    divs.forEach((div) => {
        div.classList.add('hidden');
        div.classList.add('not-md:hidden')

    })
    divs[parseInt(key)].classList.remove('hidden');
    divs[parseInt(key)].classList.remove('not-md:hidden');
}
selectbox.addEventListener('change', showInput);

api().then(() => {
    let master = document.querySelector('input[type="checkbox"]');
    master.addEventListener('change', selection);

});
ShowBut.addEventListener('click',updateSelection);
delBut.addEventListener('click', sendApi);