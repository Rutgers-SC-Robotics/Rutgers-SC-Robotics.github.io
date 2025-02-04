(function ($) {
  
  "use strict";

  const root = $('#root');
  
  function routeToAllPeople() {
    window.location.href = 'people.html';
  }

  function populateError() {
    root.empty();
    
    const errorDiv = $('<div>')
      .addClass('error-message')
      .append(
        `<h3>Error Loading Data</h3>
         <p>There was an error loading the people information. Please try again later.</p>`
      );
    
    root.append(errorDiv);
  }
  
  function populatePersonDetails(data, person_id) {
    const people_details = data.people_details;
    const person = people_details[person_id];
    
    const backButton = $('<a>')
      .addClass('back-button')
      .attr('href', '#')
      .append(
        `<i class="fas fa-arrow-left"></i> Back`
      );
    
    backButton.click(function() {
      routeToAllPeople();
    }
    );
    
    const personDiv = $('<div>')
      .addClass('person-details')
      .append(
        `<h2>${person.name}</h2>`
      );
    
    // if (person.role) {
    //   personDiv.append(
    //     `<h4>${person.role}</h4>`
    //   );
    // }
    
    if (person.img_name) {
      const img_path = `../../assets/images/people/${person.img_name}`;
      personDiv.append(
        `<img src="${img_path}" class="person-img" alt="">`
      );
    }
    
    if (person.personal_url) {
      personDiv.append(
        `<a href="${person.personal_url}" target="_blank"><strong>Personal Website</strong></a>`
      );
    }
    
    if (person.bio) {
      personDiv.append(
        `<p>${person.bio}</p>`
      );
    }
    
    
    
    root.empty();
    root.append(backButton);
    root.append(personDiv);
  }
  
  function renderLoader () {
    root.empty();
    const loader = $('<div>')
      .addClass('loader')
      .append(
        `<i class="fas fa-spinner fa-spin"></i>`
      );
    
    root.append(loader);
  }
  renderLoader();
  
  $(document).ready(function() {
    $.getJSON("../../data/people.json", function(peopleData) {
      const search = window.location.search;
      if (!search) {
        routeToAllPeople();
        return;
      }
      const person_id = search.split('=')[1];
      
      console.log(person_id);
      
      if (person_id in peopleData.people_details) {
        populatePersonDetails(peopleData, person_id);
      }
      else {
        // routeToAllPeople();
      }
      
    }).fail(function() {
      populateError();
      console.log('Error loading people.json');
    });
  });
})(window.jQuery);