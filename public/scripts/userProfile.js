const createListsHtml = function(list) {
  let removeSymbols = x => unescape(x).replace(/\+/g, ' ');
  let removedSymbolsList = list.map(removeSymbols);
  let addPTag = function(element) {
    return `<p>${element}</p>`;
  };
  return removedSymbolsList.map(addPTag).join('');
};
const showUserLists = function() {
  fetch('/getUserLists')
    .then(function(response) {
      return response.json();
    })
    .then(function(userLists) {
      let listsDiv = document.getElementById('todolists');
      listsDiv.innerHTML = createListsHtml(userLists);
    });
};
window.onload = showUserLists;
