const deleteItem = function(context) {
  console.log(context);
  let itemId = context.id.replace("del_", "");
  console.log(itemId);
  let input = document.getElementById("" + itemId);
  document.getElementById("inputItems").removeChild(input);
  let checkbox = document.getElementById("_" + itemId);
  document.getElementById("inputItems").removeChild(checkbox);
  let del_button = document.getElementById("" + context.id);
  document.getElementById("inputItems").removeChild(del_button);
};

let itemNumber = 1;

const addItem = function() {
  let listsDiv = document.getElementById("inputItems");
  let newList = document.createElement("INPUT");
  newList.setAttribute("type", "checkbox");
  newList.className = "checkBox";
  newList.id = "_" + itemNumber;
  let descriptionDiv = document.createElement("INPUT");
  descriptionDiv.setAttribute("type", "text");
  descriptionDiv.setAttribute("style", "margin-bottom:10px");
  descriptionDiv.id = "" + itemNumber;
  descriptionDiv.setAttribute("name", "item" + itemNumber);
  descriptionDiv.className = "listsData";
  let deleteButton = document.createElement("button");
  deleteButton.style.height = "20px";
  deleteButton.style.width = "50px";
  deleteButton.innerText = "Delete";
  deleteButton.id = "del_" + itemNumber;
  // let deleteSelectedItem = deleteItem.bind({ id: "del_" + itemNumber });
  deleteButton.setAttribute("onclick", `deleteItem({id:'del_${itemNumber}'});`);
  listsDiv.appendChild(deleteButton);
  listsDiv.appendChild(newList);
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
  let { content, id, status } = item;
  let checkboxHtml = `<input type="checkbox" id='_${id}' class='checkBox' name='${id}' ${status}>`;
  let deleteButton = `<button style='height:20px;width:50px' id='del_${id}' onclick='deleteItem(this)'>Delete</button>`;
  return (
    deleteButton +
    checkboxHtml +
    `<input type='text' value='${content}' class='listsData' id='${id}'><br />`
  );
  //+ deleteButton
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
