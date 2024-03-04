const book = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function () {
  const addForm = document.getElementById('formAddBook');
  addForm.addEventListener('submit', function (event) {
    addBook();
  });

  const buttonSearch = document.getElementById('buttonSearch');
  buttonSearch.addEventListener('click', function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputAuthor').value;
  const year = document.getElementById('inputYear').value;
  const checkStatus = document.getElementById('isCompleted').checked;

  const generateID = generateId();
  const bookObject = generateBookObject(generateID, title, author, year, checkStatus);
  book.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBookData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById('processedReading');
  uncompletedBookList.innerHTML = '';

  const completedBookList = document.getElementById('completedReading');
  completedBookList.innerHTML = '';

  for (const bookItem of book) {
    const bookElement = makeBookList(bookItem);
    if (!bookItem.isComplete) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});

function makeBookList(bookObject) {
  const textTitle = document.createElement('h4');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = 'Penulis : ' + bookObject.author;

  const textYear = document.createElement('p');
  textYear.innerText = 'Tahun : ' + bookObject.year;

  const containerButton = document.createElement('div');
  containerButton.classList.add('action');

  const container = document.createElement('div');
  container.classList.add('book-list');
  container.append(textTitle, textAuthor, textYear, containerButton);
  container.setAttribute('id', 'book-${bookObject.id}');

  if (bookObject.isComplete) {
    const backButton = document.createElement('button');
    backButton.innerText = 'Kembali';
    backButton.classList.add('button-back');

    backButton.addEventListener('click', function () {
      backBookToUncompleted(bookObject.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Hapus';
    deleteButton.classList.add('button-delete');

    deleteButton.addEventListener('click', function () {
      const dialog = confirm('Apakah kamu yakin ingin menghapus buku ini?');
      if (dialog == true) {
        removeBookFromProgress(bookObject.id);
      }
    });

    containerButton.append(backButton, deleteButton);
  } else {
    const doneButton = document.createElement('button');
    doneButton.innerText = 'Selesai';
    doneButton.classList.add('button-done');

    doneButton.addEventListener('click', function () {
      addBookToCompleted(bookObject.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Hapus';
    deleteButton.classList.add('button-delete');

    deleteButton.addEventListener('click', function () {
      const dialog = confirm('Apakah kamu yakin ingin menghapus buku ini?');
      if (dialog == true) {
        removeBookFromProgress(bookObject.id);
      }
    });

    containerButton.append(doneButton, deleteButton);
  }

  return container;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBookData();
}

function findBook(bookId) {
  for (const bookItem of book) {
    if (bookItem.id == bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBookFromProgress(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  book.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBookData();
}

function backBookToUncompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBookData();
}

function findBookIndex(bookId) {
  for (const index in book) {
    if (book[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveBookData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(book);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const books of data) {
      book.push(books);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBook() {
  const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();
  const getTitle = document.querySelectorAll('.book-list > h4');
  for (const bookTitle of getTitle) {
    if (bookTitle.innerText.toLowerCase().includes(searchTitle)) {
      bookTitle.parentElement.style.display = 'block';
    } else {
      bookTitle.parentElement.style.display = 'none';
    }
  }
}
