let itemNumber = 1;

const deleteItem = function(context) {
  let itemId = context.id.replace("del_", "");
  let input = document.getElementById("" + itemId);
  document.getElementById("inputItems").removeChild(input);
  let checkbox = document.getElementById("_" + itemId);
  document.getElementById("inputItems").removeChild(checkbox);
  let del_button = document.getElementById("" + context.id);
  document.getElementById("inputItems").removeChild(del_button);
};

const createDeleteButtonDiv = function(itemNumber) {
  let deleteButton = document.createElement("button");
  deleteButton.setAttribute(
    "style",
    "font-size:20px;margin-left:10px;background-color:#00ff80;border-radius: 5px"
  );
  deleteButton.innerText = "Delete";
  deleteButton.id = "del_" + itemNumber;
  deleteButton.setAttribute("onclick", `deleteItem({id:'del_${itemNumber}'});`);
  return deleteButton;
};

const createItemDiv = function(itemNumber) {
  let itemDiv = document.createElement("INPUT");
  itemDiv.setAttribute("type", "text");
  //itemDiv.setAttribute("style", "margin-bottom:10px");
  itemDiv.id = "" + itemNumber;
  itemDiv.setAttribute("name", "item" + itemNumber);
  itemDiv.setAttribute("style", "height:20px;width:200px");
  itemDiv.className = "listsData";
  return itemDiv;
};

const createCheckboxDiv = function(itemNumber) {
  let checkboxDiv = document.createElement("INPUT");
  checkboxDiv.setAttribute("type", "checkbox");
  checkboxDiv.setAttribute("style", "zoom:1.5");
  checkboxDiv.className = "checkBox";
  checkboxDiv.id = "_" + itemNumber;
  return checkboxDiv;
};

const addItem = function() {
  let itemsDiv = document.getElementById("inputItems");
  let deleteButton = createDeleteButtonDiv(itemNumber);
  let itemDiv = createItemDiv(itemNumber);
  let checkboxDiv = createCheckboxDiv(itemNumber);
  itemsDiv.appendChild(deleteButton);
  itemsDiv.appendChild(checkboxDiv);
  itemsDiv.appendChild(itemDiv);
  let br = document.createElement("br");
  itemsDiv.appendChild(br);
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
  let { content, id, status } = item;
  let checkboxHtml = `<input type="checkbox" id='_${id}' class='checkBox' name='${id}' ${status} style='zoom:1.5'>`;
  let deleteButton = `<button style='font-size:20px;margin-left:10px;background-color:#00ff80;border-radius: 5px' id='del_${id}' onclick='deleteItem(this)'>Delete</button>`;
  let inputText = `<input type='text' value='${content}' class='listsData' id='${id}' style='height:20px;width:200px'><br />`;
  return deleteButton + checkboxHtml + inputText + "<br />";
};

const createListHtml = function(list) {
  let { title, description, items } = list;
  itemNumber = items.length + 1;
  document.getElementById("selectedTitle").innerText = title;
  document.getElementById("description").innerText = description;
  document.getElementById("inputItems").innerHTML = items
    .map(createItemsHtml)
    .join("");
};

const createItemAttributes = function(checkStatus, values) {
  const conditions = { true: "checked", false: "unchecked" };
  let itemAttributes = values.reduce(
    (acc, value) => {
      acc.array.push({
        status: conditions[checkStatus[acc.index]],
        content: value
      });
      acc.index++;
      return acc;
    },
    { array: [], index: 0 }
  );
  return itemAttributes.array;
};

const addItems = function() {
  let selectedList = document.getElementById("selectedlist").value;
  let inputs = document.getElementsByClassName("listsData");
  let checkValues = document.getElementsByClassName("checkBox");
  let checkStatus = Object.keys(checkValues).map(
    key => checkValues[key].checked
  );
  let values = Object.keys(inputs).map(key => inputs[key].value);
  let itemAttributes = createItemAttributes(checkStatus, values);
  fetch("/addItems", {
    method: "POST",
    body: JSON.stringify({ itemAttributes, selectedList })
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
