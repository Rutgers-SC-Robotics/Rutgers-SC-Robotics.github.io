(function ($) {
  
  "use strict";

  const root = $('#root');
  const papersPerPage = 10;
  var currentPage = 0;
  var papers, numPages;
  
  
  function paperCompare(a, b) {
    try {
      return (a.fields.year.data[0] - b.fields.year.data[0]);
    }
    catch (e) {
      return 0;
    }
  }
  
  function renderPaperDiv(paper) {
    const paperDiv = $('<div>')
      .addClass('paper');
    
    const title = paper.getFieldAsString("title");
    const author = paper.getFieldAsString("author");
    var venue = paper.getFieldAsString("booktitle") || paper.getFieldAsString("journal") || paper.getFieldAsString("publisher");
    var year = paper.getFieldAsString("year");
    const month = paper.getFieldAsString("month");
    var url = paper.getFieldAsString("url");
    const pages = paper.getFieldAsString("pages");
    const volume = paper.getFieldAsString("volume");
    const number = paper.getFieldAsString("number");
    
    if (!url) {
      const doi = paper.getFieldAsString("doi");
      const archivePrefix = paper.getFieldAsString("archivePrefix");
      if(doi) {
        url = `https://doi.org/${doi}`;
      }
      else if (archivePrefix === "arXiv") {
        const eprint = paper.getFieldAsString("eprint");
        url = `https://arxiv.org/abs/${eprint}`;
      }
      
      
    }
    
    if (month && year) {
      year = `${month} ${year}`;
    }
    
    if (venue) {
      if (volume) {
        venue += ` ${volume}`;
      }
      if (number) {
        venue += `, no. ${number}`;
      }
      if (pages) {
        venue += `, pp.${pages}`;
      }
      if (year) {
        venue += `, ${year}`;
      }
    }
    
    paperDiv.append(
      `<span class="paper-title">${title}</span>`
    ).append(
      `<span class="paper-authors">${author}</span>`
    );
    
    if (venue) {
      paperDiv.append(
        `<span class="paper-venue">${venue}</span>`
      );
    }
    
    if (url) {
      const urlDiv = $('<div>')
        .addClass('paper-url')
        .append(
          `<a href="${url}" target="_blank" rel="noopener noreferrer">[Paper]</a>`
        );
      
      paperDiv.append(urlDiv);
    }
    
    return paperDiv;
  }

  function renderPapers(start, end) {
    const papersToRender = papers.slice(start, end);
    
    var prevYear;

    papersToRender.forEach(function (paper) {
      const year = paper.getFieldAsString("year");
      const paperDiv = renderPaperDiv(paper);
      
      if (year !== prevYear) {
        prevYear = year;
        root.append(
          `<h3 class="year-heading">${year}</h3>`
        );
      }
      root.append(paperDiv);
    });
  }
  
  function populatePapers(data) {
    root.empty();
    const bibFile = parseBibFile(data);
    papers = Object.values(bibFile.entries$).sort(paperCompare).reverse();
  }
  
  function handlePageChange() {
    const start = currentPage * papersPerPage;
    const end = start + papersPerPage;
    
    root.empty();
    renderPagination();
    renderPapers(start, end);
    renderPagination();
  }
  
  function renderPagination() {
    const numPapers = papers.length;
    numPages = Math.ceil(numPapers / papersPerPage);
    
    if (numPages <= 1) {
      return;
    }
    
    const paginationDiv = $('<nav>')
      .attr('aria-label', 'Papers Navigation')
      .append(
        $('<ul>')
          .addClass('pagination')
      );
    
    const leftArrow = $('<li>')
      .addClass('page-item');
    
    const leftArrowLink = $('<a>')
      .addClass('page-link')
      .attr('href', '#')
      .attr('aria-label', 'Previous')
      .append(
        $('<span>')
          .attr('aria-hidden', 'true')
          .text('«')
      ).append(
        $('<span>')
          .addClass('sr-only')
          .text('Previous')
      );
    
    if (currentPage === 0) {
      leftArrow.addClass('disabled');
    }
    
    leftArrow.append(leftArrowLink);
    
    leftArrow.click(function() {
      if (currentPage === 0) {
        return;
      }
      currentPage -= 1;
      handlePageChange();
    });
    
    paginationDiv.find('ul').append(leftArrow);
    
    for (var i = 0; i < numPages; i++) {
      const pageLink = $('<li>')
        .addClass('page-item');
      
      const pageLinkAnchor = $('<a>')
        .addClass('page-link')
        .attr('href', '#')
        .text(i + 1);
      
      if (i === currentPage) {
        pageLink.addClass('active');
      }
      
      pageLink.append(pageLinkAnchor);
      
      pageLink.click(function() {
        currentPage = $(this).text() - 1;
        handlePageChange();
      });
      
      paginationDiv.find('ul').append(pageLink);
      
      
    }
    
    const rightArrow = $('<li>')
      .addClass('page-item');
    
    const rightArrowLink = $('<a>')
      .addClass('page-link')
      .attr('href', '#')
      .attr('aria-label', 'Next')
      .append(
        $('<span>')
          .attr('aria-hidden', 'true')
          .text('»')
      ).append(
        $('<span>')
          .addClass('sr-only')
          .text('Next')
      );
    
    if (currentPage === numPages - 1) {
      rightArrow.addClass('disabled');
    }
    
    rightArrow.append(rightArrowLink);
    
    
    rightArrow.click(function() {
      if (currentPage === numPages - 1) {
        return;
      }
      currentPage += 1;
      handlePageChange();
    });
    
    paginationDiv.find('ul').append(rightArrow);
    
    root.append(paginationDiv);
  }
  
  function populateError() {
    root.empty();
    
    const errorDiv = $('<div>')
      .addClass('error-message')
      .append(
        `<h3>Error Loading Data</h3>
         <p>Please try again later</p>`
      );
    
    root.append(errorDiv);
  }
  
  function renderLoader() {
    root.empty();
    const loader = $('<div>')
      .addClass('loader')
      .append(
        `<i class="fas fa-spinner fa-spin"></i>`
      );
    
    root.append(loader);
  }
  
  renderLoader();
  
  $(document).ready(function () {
    $.ajax({
             url: "../../data/papers.bib",
             dataType: "text",
             success: function (data) {
               populatePapers(data);
        renderPagination();
        handlePageChange();
      },
      error: function() {
        populateError();
        console.log('Error loading papers.bib');
      }
    });
  });
})(window.jQuery);