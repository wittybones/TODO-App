let itemNumber = 1;

const addItem = function() {
  let listsDiv = document.getElementById('inputItems');
  let newList = document.createElement('INPUT');
  newList.setAttribute('type', 'checkbox');
  listsDiv.appendChild(newList);
  let descriptionDiv = document.createElement('INPUT');
  descriptionDiv.setAttribute('type', 'text');
  descriptionDiv.setAttribute(
    'style',
    'width:100px;height:15px;margin-bottom:10px'
  );
  descriptionDiv.setAttribute('name', 'item' + itemNumber);
  descriptionDiv.className = 'listsData';
  listsDiv.appendChild(descriptionDiv);
  let br = document.createElement('br');
  listsDiv.appendChild(br);
  itemNumber++;
};

const createOptionHtml = function(title) {
  return `<option value="${title}">${title}</option>`;
};

const displayContent = function() {
  fetch('/displayList')
    .then(function(myLists) {
      return myLists.json();
    })
    .then(function(myTitles) {
      let optionHtml = myTitles.map(createOptionHtml).join('');
      document.getElementById('selectedlist').innerHTML = optionHtml;
    });
};

const addList = function() {
  let title = document.getElementById('listTitle').value;
  let description = document.getElementById('listDescription').value;
  fetch('/addList', {
    method: 'POST',
    body: JSON.stringify({ title, description })
  }).then(function(response) {
    displayContent();
  });
};

window.onload = displayContent;
