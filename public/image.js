

let mainBox = document.querySelector('.main');
async function Api() {
    const res = await fetch('/session-storage-image')
    const data = await res.json();
    for(let i in data){
        console.log(data[i]);
        InsertPass(data[i]['img']['data'],data[i]['img']['contentType'],data[i]['name'],data[i]['parent'],data[i]['class'],data[i]['from'],data[i]['to'],data[i]['fee'],data[i]['fromDate'],data[i]['toDate'],data[i]['Institute']);
    }
}

function InsertPass(data,contentType,name,parent,clas,from,to,fee,fromDate,toDate,Institute) {
    const src = `data:${contentType};base64,${data}`;
    const ele = document.createElement('div');
    ele.innerHTML = `<div class="box1 h-[45vh] w-[40vw] border-2 border-black mx-[5vw] mt-5 not-md:h-[40vh] not-md:w-[90vw] not-md:text-base">
            <p class="text-center font-bold text-xl my-2 not-md:text-lg">${Institute}</p>
            <div class="box3 flex justify-center items-center">
                <div class="box2 flex justify-between w-[30vw] not-md:w-[80vw]">
                    <div class="img border-2 border-black w-[8vw] h-[15vh] not-md:h-[10vh] not-md:w-[20vw]"><img src="${src}" class="border-2 border-black w-[8vw] h-[15vh] not-md:h-[10vh] not-md:w-[20vw] object-cover" /></div>
                    <p >दिनांक-</p>
                </div>
            </div>

            <p class="mx-2 mt-5">प्रमाणित किया जाता है कि <span class="font-bold underline" >${name}</span> पुत्र/पुत्री <span class="font-bold underline" >${parent}</span> कक्षा- <span class="font-bold underline" >${clas}</span> ने हरियाणा रोड़वेज के
                बस पास के लिए रूपये <span class="font-bold underline" >${fee}</span>/- जमा
                करवा दिये हैं जो कि <span class="font-bold underline" >${to}</span> से <span class="font-bold underline" >${from}</span>
                तक दिनांक <span class="font-bold underline" >${fromDate}</span> से
                <span class="font-bold underline" >${toDate}</span> मान्य है।</p>
            <p class="font-bold mx-2 mt-6">प्रभारी बस पास</p>
        </div>`
    mainBox.append(ele);
}
Api()