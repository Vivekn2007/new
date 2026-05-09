
let tbod = document.querySelector('tbody');
async function api() {
    let resp = await fetch('/table-view');
    let data = await resp.json();
    try {
        
        let obj = data['data'];
        let count =1;
        for (let dat in obj) {

            let ele = obj[dat];
            console.log(ele);
            table(count, ele["name"], ele["parent"], ele["class"], ele["from"], ele["to"], ele["fee"]);
            count = count+1;
        }
    } catch {
        console.log('No data');
    }

}
function table(id, name, parent, clas, from, to, fee) {
    let newTag = document.createElement('tr');
    newTag.innerHTML = `
                            
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
api();