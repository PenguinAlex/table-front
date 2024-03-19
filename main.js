
//обьявляем переменные для фильтрации и находим заголовки таблицы для сортировки
const tableBody = document.getElementById('table-body');
const FioTH = document.getElementById('thFIO'),
  FacultyTH = document.getElementById('thFaculty'),
  BirthTH = document.getElementById('thBirth'),
  StudyYearTH = document.getElementById('thStudyYear'),
  formFilter = document.getElementById('form-filter'),
  filterFIO = document.getElementById('filter__fio'),
  filterFaculty = document.getElementById('filter__faculty'),
  filterStudyStart = document.getElementById('filter__study-start'),
  filterStudyEnd = document.getElementById('filter__study-end');

//находим элементы из html для валидации формы
const formAdd = document.getElementById('form-add'),
  nameInput = document.getElementById('form-add__name'),
  surnameInput = document.getElementById('form-add__surname'),
  middlenameInput = document.getElementById('form-add__middlename'),
  birthInput = document.getElementById('form-add__birth'),
  studyYearInput = document.getElementById('form-add__yearstudy'),
  facultyInput = document.getElementById('form-add__faculty');


// Функция по добавлению 1 студента из массива

function getStudentItem(studentObj) {
  // создаем элементы таблицы

  const tableTR = document.createElement('tr'),
    tableTdFIO = document.createElement('td'),
    tableTdFaculty = document.createElement('td'),
    tableTdBirthYear = document.createElement('td'),
    tableTdYearStudy = document.createElement('td'),
    tableTdDelete = document.createElement('td');

  //вычисляем возраст студента
  function getBirthDate(birthDateString) {
    let birthDate = new Date(birthDateString);
    let month = birthDate.getMonth() + 1;
    let fulldate = birthDate.getDate() + '.' + month.toString().padStart(2, '0') + '.' + birthDate.getFullYear();
    return fulldate;
  }
  function getAge(dateString) {
    let today = new Date();
    let birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age % 10 === 2 || age % 10 === 3 || age % 10 === 4) {
      return age + ' ' + 'года';
    } else if (age % 10 === 1) {
      return age + ' ' + 'год';
    } else {
      return age + ' ' + 'лет';
    }
  }
  //вычисляем курс студента
  function getCurs(studyDate) {
    let today = new Date();
    let dateStudy = new Date(parseInt(studyDate), 09, 01)
    let curs = today.getFullYear() - dateStudy.getFullYear();
    if (today.getMonth() >= 8) curs++;
    if (curs > 4) {
      return 'Закончил';
    } else {
      return curs + ' ' + 'курс';
    }

  }

  // переносим студента в таблицу из массива
  studentObj.fio = studentObj.surname + ' ' + studentObj.name + ' ' + studentObj.lastname;
  tableTdFIO.textContent = studentObj.fio;
  tableTdFaculty.textContent = studentObj.faculty;
  tableTdBirthYear.textContent = getBirthDate(studentObj.birthday) + ' ' + '(' + getAge(studentObj.birthday) + ')';
  tableTdYearStudy.textContent = studentObj.studyStart + '-' + (parseInt(studentObj.studyStart) + 4) + ' ' + '(' + getCurs(studentObj.studyStart) + ')';
  tableTdDelete.innerHTML = '&#x2715';


  tableTdDelete.addEventListener('click', function () {
    if (!confirm('Вы уверены?')) {
      return;
    }
    tableTR.remove();
    fetch(`http://localhost:3000/api/students/${studentObj.id}`, {
      method: 'DELETE',
    })
  })
  // помещаем все данные в таблицу

  tableTR.append(tableTdFIO);
  tableTR.append(tableTdFaculty);
  tableTR.append(tableTdBirthYear);
  tableTR.append(tableTdYearStudy);
  tableTR.append(tableTdDelete);


  return tableTR;
}


// Функция добавления всех студентов
let direction = true;
let flag = 'fio';


async function renderStudentsTable() {

  //находим тело таблицы и очищаем от предыдущих маневров

  const response = await fetch(`http://localhost:3000/api/students`);
  const studentList = await response.json();


  studentList.forEach(studentItem => {
    const studentElement = getStudentItem(studentItem);
    tableBody.append(studentElement)
  });

  tableBody.innerHTML = '';

  let studentsArrayCopy = [...studentList];


  //обьединяем фио и подсчитываем год окончания обучения

  for (const studentObj of studentsArrayCopy) {
    studentObj.fio = studentObj.surname + ' ' + studentObj.name + ' ' + studentObj.lastname;
    studentObj.studyEnd = (parseInt(studentObj.studyStart) + 4);
  }

  //прописываем сортировку ко всему


  studentsArrayCopy = studentsArrayCopy.sort(function (a, b) {
    let sort = a[flag] < b[flag];
    if (direction === false) sort = a[flag] > b[flag];
    return sort ? -1 : 1;
  })


  // прописываем фильтрацию

  if (filterFIO.value.trim() !== '') {
    studentsArrayCopy = studentsArrayCopy.filter(function (item) {
      if (item.fio.includes(filterFIO.value.trim())) return true;
    })
  }
  if (filterStudyStart.value.trim() !== '') {
    studentsArrayCopy = studentsArrayCopy.filter(function (item) {
      if (item.studyStart === filterStudyStart.value.trim()) return true;
    })
  }
  if (filterStudyEnd.value.trim() !== '') {
    studentsArrayCopy = studentsArrayCopy.filter(function (item) {
      if (item.studyEnd === filterStudyEnd.value.trim()) return true;
    })
  }
  if (filterFaculty.value.trim() !== '') {
    studentsArrayCopy = studentsArrayCopy.filter(function (item) {
      if (item.faculty.includes(filterFaculty.value.trim())) return true;
    })
  }

  //заполняем таблицу студентами из массива

  for (const i of studentsArrayCopy) {
    const newTR = getStudentItem(i);
    tableBody.append(newTR)
  }

}
renderStudentsTable();



// Валидация формы и добавление студентов

//создаем условия валидации



formAdd.addEventListener('submit', async function (e) {
  e.preventDefault();
    const response = await fetch('http://localhost:3000/api/students', {
      method: 'POST',
      body: JSON.stringify({
        name: nameInput.value,
        surname: surnameInput.value,
        lastname: middlenameInput.value,
        birthday: new Date(birthInput.value),
        studyStart: studyYearInput.value,
        faculty: facultyInput.value,

      }),
      headers: {
        'Content-type': 'application/json',
      }
    })
    const student = await response.json();
    // console.log(student)
    // renderStudentsTable();

    // очищаем форму

    formAdd.submit();
    formAdd.reset();
})

// форма фильтрации

function Delay() {
  renderStudentsTable();
  if (TimeOutID) {
    clearTimeout(TimeOutID);
  }

}

formFilter.addEventListener('input', function (e) {
  e.preventDefault();
  TimeOutID = setTimeout(Delay, 500);
})


//события сортировки

FioTH.addEventListener('click', function () {
  flag = 'fio';
  direction = !direction;
  renderStudentsTable();
})

FacultyTH.addEventListener('click', function () {
  flag = 'faculty';
  direction = !direction;
  renderStudentsTable();
})
BirthTH.addEventListener('click', function () {
  flag = 'birthday';
  direction = !direction;
  renderStudentsTable();
})
StudyYearTH.addEventListener('click', function () {
  flag = 'studyStart';
  direction = !direction;
  renderStudentsTable();
})


