const $ = function (element) { return document.getElementById(element); }

const parse_map = [
  {
    element: 'title',
    pattern: /(%{1})\s([^\n]+)/g,
    replace: '$2',
  },
  {
    element: 'heading',
  	pattern: /(#{2,6})\s([^\n]+)/g,
  	replace: '$2', //'<h$1>$2</h$1>',
  },
  {
    element: 'paragraph',
  	pattern: /\n(?!<\/?\w+>|\s?\*|\s?[0-9]+|>|\&gt;|-{5,})([^\n]+)/g,
  	replace: '$1',
  },
  {
    element: 'blockquote',
  	pattern: /\n(?:&gt;|\>)\W*(.*)/g,
  	replace: '$1', //"<blockquote><p>$1</p></blockquote>",
  },
  {
    element: 'list',
  	pattern: /\n\s?\*|\-\s*(.*)/g,
  	replace: '$1', //"<ul>\n\t<li>$1</li>\n</ul>",
  },
  {
    element: 'list',
  	pattern: /\n\s?[0-9]+\.\s*(.*)/g,
  	replace: '$1', //"<ol>\n\t<li>$1</li>\n</ol>",
  },
  {
    element: 'strong',
  	pattern: /(\*\*|__)(.*?)\1/g,
  	replace: "<strong>$2</strong>",
  },
  {
    element: 'emphasis',
  	pattern: /(\*|_)(.*?)\1/g,
  	replace: "<em>$2</em>",
  },
  {
    element: 'image',
  	pattern: /!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g,
  	replace: "<img src=\"$1\" alt=\"$2\" />",
  },
  {
    element: 'anchor',
  	pattern: /\[(.*)\]\((\S+)(.*)\)/g,
  	replace: '<a href="#" onclick="MDNS.jump(\'$2\')">$1</a>',
  },
];

var game = {};

const MDNS = {}

MDNS.parse = function (markdown) {
  let lines = markdown.split(/\r\n|\n/);
  
  let story = {};
  story.title = '';
  story.defs = {
    current_section: '',
    current_paragraph: 0      
  };

  let section = '';
  let element = '';
  
  for (let line in lines) {
    
    if (lines[line] == '') {
      element = '';
    }
    
    parse_map.forEach(function (md) {
      
      let match_list = lines[line].match(md.pattern);
      if (match_list != null) {
        lines[line] = lines[line].replace(md.pattern, md.replace);
        element = md.element;
        switch (element) {
          case 'heading':
            let section_title = lines[line];
            section = section_title.toLowerCase();
            section = section.replace(/\s/g, '-');
            story[section] = {
              title: section_title,
              text: new Array(),
              choices: new Array(),
            };
            if (story.defs.current_section == '') {
              story.defs.current_section = section;
            }
            break;
          case 'title':
            story.title = lines[line];
            break;
          case 'list':
            story[section].choices[story[section].choices.length] = lines[line];
            break;
        }
      }
    });
    if (element != 'title' && element != 'heading' && element != 'list' && element != 'anchor') {
      if (lines[line] != '') {
        story[section].text[story[section].text.length] = lines[line];
      }
    }
  }
  
  return story;
}

MDNS.jump = function (section) {
  game.story.defs.current_section = section;
  game.story.defs.current_paragraph = 0;
  
  MDNS.create('hr', '', '');
  $('choices').classList.add('invisible');
    
  window.requestAnimationFrame(function () {
    $('game').removeChild($('choices'));
  });
  
  MDNS.next();
}

MDNS.next = function () {
  if ($('more') != null) {
    $('game').removeChild($('more'));
  }
  
  let s = game.story.defs.current_section;
  let p = game.story.defs.current_paragraph;
  MDNS.create('p', '', game.story[s].text[p]);
  
  p++;
  
  if (p >= game.story[s].text.length) {
    if (game.story[game.story.defs.current_section].choices.length > 0) {
      let choices_list = document.createElement('ul');
      choices_list.id = 'choices';
    
      for (let i in game.story[game.story.defs.current_section].choices) {
        let list_item = document.createElement('li');
        list_item.innerHTML = game.story[game.story.defs.current_section].choices[i].replace(parse_map[9].pattern, parse_map[9].replace);
        choices_list.appendChild(list_item);
      }    
      choices_list.classList.add('invisible');

      //$('game').appendChild(choices_list);
      $('game').insertBefore(choices_list, $('EndOfScript'));

      window.requestAnimationFrame(function () {
        choices_list.classList.remove('invisible');
        $('EndOfScript').scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'end' 
        });
      });
    }
  }
  else {
    game.story.defs.current_paragraph = p;
    MDNS.create('p', 'more', '<a href="#" onclick=MDNS.next()>(…)</a>');
  }
}

MDNS.create = function (type, id, html) {
  let element = document.createElement(type);
  if (id != '') element.id = id;
  if (html != '') element.innerHTML = html;
  element.classList.add('invisible');
  //$('game').appendChild(element);
  $('game').insertBefore(element, $('EndOfScript'));
 
  window.requestAnimationFrame(function () {
    element.classList.remove('invisible');
    $('EndOfScript').scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'end' 
    });
  }); 
}

MDNS.begin = function (story) {
  let element = document.createElement('div');
  element.id = 'game';
  document.body.insertBefore(element, $('MDNS'));
  
  game.story = MDNS.parse(MDNS.decode(story));
  
  game.story.defs.stop = document.createElement('div');
  game.story.defs.stop.id = 'EndOfScript';
  $('game').appendChild(game.story.defs.stop);
  
  MDNS.create('h1', '', game.story.title);
    
  MDNS.next();
}

MDNS.decode = function (str) {
  percentEncodedStr = atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join('');
  return decodeURIComponent(percentEncodedStr);
}