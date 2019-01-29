let itemNumber = 1;

const addItem = function() {
  let listsDiv = document.getElementById("inputItems");
  let newList = document.createElement("INPUT");
  newList.setAttribute("type", "checkbox");
  listsDiv.appendChild(newList);
  let descriptionDiv = document.createElement("INPUT");
  descriptionDiv.setAttribute("type", "text");
  descriptionDiv.setAttribute(
    "style",
    "width:100px;height:15px;margin-bottom:10px"
  );
  descriptionDiv.setAttribute("name", "item" + itemNumber);
  descriptionDiv.className = "listsData";
  listsDiv.appendChild(descriptionDiv);
  let br = document.createElement("br");
  listsDiv.appendChild(br);
  itemNumber++;
};

const createOptionHtml = function(title) {
  return `<option value="${title}">${title}</option>`;
};

const displayContent = function() {
  fetch("/displayList")
    .then(function(myLists) {
      return myLists.json();
    })
    .then(function(myTitles) {
      let optionHtml = myTitles.map(createOptionHtml).join("");
      document.getElementById("selectedlist").innerHTML = optionHtml;
    });
};

const addList = function() {
  let title = document.getElementById("listTitle").value;
  let description = document.getElementById("listDescription").value;
  fetch("/addList", {
    method: "POST",
    body: JSON.stringify({ title, description })
  }).then(function(response) {
    displayContent();
  });
};

const createItemsHtml = function(item) {
  let { content, id } = item;
  return `<input type='text' value='${content}' id='${id}'>`;
};

const createListHtml = function(list) {
  let { title, description, items } = list;
  document.getElementById("selectedTitle").innerText = title;
  document.getElementById("description").innerText = description;
  document.getElementById("inputItems").innerHTML = items
    .map(createItemsHtml)
    .join("");
};

const addItems = function() {
  let selectedList = document.getElementById("selectedlist").value;
  console.log(selectedList);
  let inputs = document.getElementsByClassName("listsData");
  let values = Object.keys(inputs).map(key => inputs[key].value);
  fetch("/addItems", {
    method: "POST",
    body: JSON.stringify({ values, selectedList })
  }).then(function(response) {
    console.log(response);
  });
};

const edit = function() {
  let selectList = document.getElementById("selectedlist").value;
  fetch("/getSelectedList", { method: "POST", body: selectList })
    .then(function(response) {
      return response.json();
    })
    .then(function(list) {
      createListHtml(list);
    });
};

const deleteList = function() {
  let selectList = document.getElementById("selectedlist").value;
  fetch("/deleteList", { method: "POST", body: selectList }).then(function(
    response
  ) {
    displayContent();
  });
};

window.onload = displayContent;
