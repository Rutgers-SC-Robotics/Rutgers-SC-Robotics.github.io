(function ($) {
  
  "use strict";

  const root = $('#root');
  
  function routeToPersonDetails(person_id) {
    window.location.href = 'people_details.html?person_id=' + person_id;
  }

  function populateCategories(data) {
    root.empty();
    
    
    const people_details = data.people_details;
    for (const [category_id, categoryDetails] of Object.entries(data.categories)) {
      if (categoryDetails.people.length === 0) {
        continue;
      }
      
      const show_images = categoryDetails.show_images;
      
      const categoryDiv = $('<div>')
        .addClass('category')
        .attr('show-images', show_images)
        .attr('data-category', category_id)
        .append(
          `<h3>${categoryDetails.category_name}</h3>`
        );
      
      var parentDiv = categoryDiv;
      if (show_images) {
        const imageGridDiv = $('<div>').addClass('image-grid');
        categoryDiv.append(imageGridDiv);
        parentDiv = imageGridDiv;
      }
      
      root.append(categoryDiv);
      
      // Loop through each person in the category
      categoryDetails.people.forEach(person_id => {
        var personDiv;

        if (person_id in people_details) {
          personDiv = $('<div>').addClass('person-card');
          
          personDiv.click(function() {
              routeToPersonDetails(person_id);
            }
          );
          
          
          const person = people_details[person_id];
          const img_path = `../../assets/images/people/${person.img_name}`;
          
          personDiv.append(
              `<img src="${img_path}" class="person-img" alt="">`
          )
          
          const personName = person.role ? `${person.name}, ${person.role}` : person.name;
          personDiv.append(
            `${personName}`
          );
        }
        else {
          personDiv = $('<div>').addClass('person-line');
          
          personDiv.append(
              `${person_id}`
          );
        }

        parentDiv.append(personDiv);
      });
    }
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
      populateCategories(peopleData);
    }).fail(function() {
      populateError();
      console.log('Error loading people.json');
    });
  });
})(window.jQuery);