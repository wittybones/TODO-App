const addItem = function() {
  let listsDiv = document.getElementById('todolists');
  let newList = document.createElement('INPUT');
  newList.setAttribute('type', 'checkbox');
  listsDiv.appendChild(newList);
  let descriptionDiv = document.createElement('INPUT');
  descriptionDiv.setAttribute('type', 'text');
  descriptionDiv.className = 'listsData';
  listsDiv.appendChild(descriptionDiv);
};
