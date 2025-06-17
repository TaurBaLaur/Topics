let topics = null;
let sections = null;

let lastHoldButtonElement = null;
let lastDownElement = null;
let holdTimer = null;

function closeAddForm() {
    document.getElementById('add-form').classList.remove('visible');
    document.getElementById('topic-form').classList.remove('visible');
    document.getElementById('section-form').classList.remove('visible');
    document.getElementById('topic-title').value = '';
    document.getElementById('summary-field').value = '';
    document.getElementById('details-field').value = '';
}

function createTopicElement(topic){
    return `<div class="topic">
                <span>${topic.title}</span> 
                <button class="delete-button hidden" onclick="deleteTopic(this)">
                    <img alt="close" src="x-mark.svg" height="30">
                </button>
            </div>`;
}

async function getTopics(){
    try{
        const response = await fetch('/topics');
        const respBody = await response.json();
        if(response.ok){
            topics = new Map(respBody.topics.map((t) => [t.title, t]));
        }else{
            alert(respBody.message);
        }
    }catch(error){
        alert(error);
    }
}

async function addTopic(){
    const topicTitle = document.getElementById('topic-title').value.trim();
    if(topicTitle.length === 0){
        alert('You must enter a topic!');
    } else{
        if(topics.has(topicTitle)){
            alert('This topic already exists!');
        }else{
            const newTopic = {title:topicTitle};

            try{
                const response = await fetch('/topics', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newTopic),
                });
                const respBody = await response.json();
                if(response.ok){
                    topics.set(topicTitle,newTopic);
                    document.getElementById('topics-container').innerHTML += createTopicElement(newTopic);
                    alert(respBody.message);
                }else{
                    alert(respBody.message);
                }
            }catch(error){
                alert(error);
            }finally{
                closeAddForm();
            }
        }
    }
}

async function deleteTopic(topic){
    try{
        const response = await fetch(`/topics/${topic.parentElement.firstElementChild.innerText}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });
        const respBody = await response.json();
        if(response.ok){
            topic.parentElement.classList.add('clear');

            topic.parentElement.addEventListener('animationend', () => {
                document.getElementById(topic.parentElement.parentElement.id).removeChild(topic.parentElement);
            }, { once: true });

            topics.delete(topic.parentElement.firstElementChild.innerText)

            alert(respBody.message);
        }else{
            alert(respBody.message);
        }
    }catch(error){
        alert(error);
    }
}

async function displayTopics(){
    if(topics===null){
        await getTopics();
        Array.from(topics.values()).forEach(topic => {
            document.getElementById('topics-container').innerHTML += createTopicElement(topic);
        });
        document.getElementById('topics-container').classList.add('visible-grid');
    }else{
        document.title = 'Topics';
        document.getElementById('h1').innerHTML = 'My topics';
        document.getElementById('back').classList.add('hidden');

        document.getElementById('sections-list').classList.add('hidden');
        document.getElementById('add-section-button').classList.add('hidden');
        document.getElementById('section-form').classList.remove('visible');

        document.getElementById('topics-container').classList.add('visible-grid');
        document.getElementById('add-topic-button').classList.remove('hidden');
    }
}

function createSectionElement(section){
    return `<li>
                <details>
                    <summary>
                        <span>${section.summary}</span>
                    </summary>
                    <div>${section.details}</div>
                    <button class="delete-button hidden" onclick="deleteSection(this)">
                        <img alt="close" src="x-mark.svg" height="30">
                    </button>
                </details>
            </li>`;
}

async function getSections(topic){
    try{
        const response = await fetch(`/topics/${topic}/sections`);
        const respBody = await response.json();
        if(response.ok){
            sections = new Map(respBody.sections.map((s) => [s.summary, s]));
        }else{
            alert(respBody.message);
        }
    }catch(error){
        alert(error);
    }
}

async function addSection(){
    let summary=document.getElementById('summary-field').value.trim();
    let details=document.getElementById('details-field').value.trim().replace(/\n/g, '<br>');

    if(summary!=='' && details!==''){
        if(sections.has(summary)){
            alert('This section already exists for this topic!');
        }else{
            const newSection = {summary:summary,details:details,topic: document.getElementById('h1').innerText};

            try{
                const response = await fetch(`/topics/${document.getElementById('h1').innerText}/sections`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newSection),
                });
                const respBody = await response.json();
                if(response.ok){
                    sections.set(summary, newSection);
                    document.getElementById('sections-list').innerHTML += createSectionElement(newSection);
                    alert(respBody.message);
                }else{
                    alert(respBody.message);
                }
            }catch(error){
                alert(error);
            }finally{
                closeAddForm();
            }
        }


    }else{
        alert('You must enter both summary and details!');
    }
}

async function deleteSection(section){
    try{
        const response = await fetch(`/topics/${document.getElementById('h1').innerText}/sections/${section.parentElement.firstElementChild.innerText}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });
        const respBody = await response.json();
        if(response.ok){
            section.parentElement.parentElement.classList.add('clear');

            section.parentElement.parentElement.addEventListener('animationend', () => {
                document.getElementById(section.parentElement.parentElement.parentElement.id).removeChild(section.parentElement.parentElement);
            }, { once: true });

            sections.delete(section.parentElement.firstElementChild.innerText);

            alert(respBody.message);
        }else{
            alert(respBody.message);
        }
    }catch(error){
        alert(error);
    }
}

async function displaySections(topic){
    await getSections(topic);

    document.title += ` - ${topic}`;
    document.getElementById('h1').innerHTML = topic;

    document.getElementById('sections-list').innerHTML = '';
    Array.from(sections.values()).forEach(section => {
        document.getElementById('sections-list').innerHTML += createSectionElement(section);
    });

    document.getElementById('back').classList.remove('hidden');

    document.getElementById('topics-container').classList.remove('visible-grid');
    document.getElementById('add-topic-button').classList.add('hidden');
    document.getElementById('topic-form').classList.remove('visible');

    document.getElementById('sections-list').classList.remove('hidden');
    document.getElementById('add-section-button').classList.remove('hidden');

}

document.addEventListener('click', (e) => {
    if (document.getElementById('add-form').classList.contains('visible') && e.target===document.getElementById('add-form')) {
        closeAddForm();
    }
});

document.getElementById('close').addEventListener('click', closeAddForm);

document.getElementById('back').addEventListener('click', displayTopics);

document.getElementById('add-topic-button').addEventListener('click',(event)=>{
    document.getElementById('add-form').classList.add('visible');
    document.getElementById('topic-form').classList.add('visible');
    event.stopPropagation();
});

document.getElementById('add-topic-form-button').addEventListener('click', ()=>{
    addTopic();
});

document.getElementById('topic-title').addEventListener('keyup',(event)=>{
    if(event.key==="Enter"){
        addTopic();
    }
});

document.getElementById('add-section-button').addEventListener('click', (event)=>{
    document.getElementById('add-form').classList.add('visible');
    document.getElementById('section-form').classList.add('visible');
    event.stopPropagation();
});

document.getElementById('add-section-form-button').addEventListener('click', ()=>{
    addSection();
});

document.getElementById('sections-list').addEventListener('click',(event)=>{
    event.preventDefault();
});

document.getElementById('topics-container').addEventListener('pointerdown',(event)=>{
    if(event.target.classList.contains('topic') || event.target.tagName==='SPAN'){
        let targetTopic = null;
        if(event.target.tagName==='SPAN'){
            targetTopic=event.target.parentElement;
        }else{
            targetTopic = event.target;
        }

        if(!targetTopic.lastElementChild.classList.contains('visible')){
            holdTimer = setTimeout(() => {
                if(lastHoldButtonElement!==null){
                    lastHoldButtonElement.classList.remove('visible');
                }
                targetTopic.lastElementChild.classList.add('visible');
                lastHoldButtonElement = targetTopic.lastElementChild; 
                event.stopPropagation();
            }, 750);
        }
    } else if(event.target.classList.contains('delete-button') || event.target.parentElement.classList.contains('delete-button')){
        event.stopPropagation();
    }
});

document.getElementById('sections-list').addEventListener('pointerdown',(event)=>{
    if(event.target.tagName==='DETAILS' || event.target.tagName==='SUMMARY' || event.target.tagName==='DIV' || event.target.tagName==='SPAN'){
        let targetDetails = null;
        if(event.target.tagName==='SUMMARY' || event.target.tagName==='DIV'){
            targetDetails=event.target.parentElement;
        }else if(event.target.tagName==='SPAN'){
            targetDetails=event.target.parentElement.parentElement;
        }else{
            targetDetails = event.target;
        }

        if(!targetDetails.lastElementChild.classList.contains('visible')){
            holdTimer = setTimeout(() => {
                if(lastHoldButtonElement!==null){
                    lastHoldButtonElement.classList.remove('visible');
                }
                targetDetails.lastElementChild.classList.add('visible');
                targetDetails.open=true;
                lastHoldButtonElement = targetDetails.lastElementChild; 
                event.stopPropagation();
            }, 750);
        }
    } else if(event.target.classList.contains('delete-button') || event.target.parentElement.classList.contains('delete-button')){
        event.stopPropagation();
    }
});

document.addEventListener('pointerdown',(event)=>{
    lastDownElement = event.target;
    if(event.target.tagName==='SPAN' || (event.target.parentElement!==null && event.target.parentElement.tagName==='DETAILS' && event.target.tagName==='DIV')){
        lastDownElement=event.target.parentElement;
    }
    if(lastHoldButtonElement!==null){
        lastHoldButtonElement.classList.remove('visible');
    }
});

document.addEventListener('pointerup',(event)=>{
    clearTimeout(holdTimer);
    let eventTarget = event.target;
    if(eventTarget.tagName==='SPAN' || (eventTarget.parentElement!==null && eventTarget.parentElement.tagName==='DETAILS' && event.target.tagName==='DIV')){
        eventTarget = eventTarget.parentElement;
    }

    if(lastDownElement === eventTarget){
        if(document.getElementById('topics-container').classList.contains('visible-grid')){
            if(lastHoldButtonElement!==eventTarget.lastElementChild && eventTarget.classList.contains('topic')){
                lastHoldButtonElement=null;
                displaySections(eventTarget.firstElementChild.innerText)
            } else if(!eventTarget.classList.contains('topic') || (lastHoldButtonElement===eventTarget.lastElementChild && eventTarget.lastElementChild!==null && !eventTarget.lastElementChild.classList.contains('visible'))){
                if(lastHoldButtonElement!==null){
                    lastHoldButtonElement=null;
                }
            }
        }else{
            if(eventTarget.tagName==='SUMMARY' && !eventTarget.parentElement.open){
                eventTarget.parentElement.open = true;
            }else if(eventTarget.tagName==='SUMMARY' && lastHoldButtonElement!==eventTarget.parentElement.lastElementChild && eventTarget.parentElement.open && !eventTarget.parentElement.lastElementChild.classList.contains('visible')){
                eventTarget.parentElement.open = false;
            }else if(eventTarget.tagName!=='HTML' && eventTarget.lastElementChild!==null && ((lastHoldButtonElement===eventTarget.lastElementChild && !eventTarget.lastElementChild.classList.contains('visible')) || (lastHoldButtonElement===eventTarget.parentElement.lastElementChild && !eventTarget.parentElement.lastElementChild.classList.contains('visible')))){
                if(lastHoldButtonElement!==null){
                    lastHoldButtonElement=null;
                }
            }
        }
    }
});

document.getElementById('topics-container').addEventListener('pointerout',()=>{
    clearTimeout(holdTimer);
});

document.getElementById('sections-list').addEventListener('pointerout',()=>{
    clearTimeout(holdTimer);
});

window.addEventListener('load', displayTopics);