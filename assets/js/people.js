(function ($) {
  
  "use strict";
  
  $(document).ready(function() {
    var root = $('#root');
    
    $.getJSON("../../data/people.json", function(data) {
      // Function to populate categories
      function populateCategories() {
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
          
          // Loop through each person in the category
          categoryDetails.people.forEach(person_id => {
            var personDiv;

            if (person_id in people_details) {
              personDiv = $('<div>').addClass('person-card');
              
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
          
          root.append(categoryDiv);
        }
      }
      
      // Start population after JSON load
      populateCategories();
    }).fail(function() {
      console.log('Error loading people.json');
    });
  });
})(window.jQuery);