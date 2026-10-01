<h2 id="publications">Publications</h2>

<div class="pubcards">
{% for link in site.data.publications.main %}
{% assign year = link.conference | split: ", " | last | slice: -4, 4 %}
{% assign href = link.pdf | default: link.page | default: link.code %}
<article class="pubcard">
  {% if link.image %}<a class="pubcard-thumb" href="{{ href }}" target="_blank" rel="noopener"><img src="{{ link.image }}" alt="{{ link.title }}" loading="lazy"></a>{% endif %}
  <div class="pubcard-text">
    <div class="pubcard-badges">
      {% if link.conference_short %}<span class="pubcard-venue">{{ link.conference_short }} {{ year }}</span>{% endif %}
      {% if link.notes %}<span class="pubcard-venue alt">{{ link.notes }}</span>{% endif %}
    </div>
    <h3><a href="{{ href }}" target="_blank" rel="noopener">{{ link.title }}</a></h3>
    <div class="pubcard-authors" title="{{ link.authors }}">{% assign names = link.authors | split: "; " %}{% for n in names %}{% assign last = n | split: ", " | first %}{% if last == "Saleh" %}<b>Saleh</b>{% else %}{{ last }}{% endif %}{% unless forloop.last %}, {% endunless %}{% endfor %}</div>
    <div class="pubcard-links">
      {% if link.pdf %}<a href="{{ link.pdf }}" target="_blank" rel="noopener">PDF</a>{% endif %}
      {% if link.code %}<a href="{{ link.code }}" target="_blank" rel="noopener">Code</a>{% endif %}
      {% if link.page %}<a href="{{ link.page }}" target="_blank" rel="noopener">Project</a>{% endif %}
      {% if link.bibtex %}<a href="{{ link.bibtex }}" target="_blank" rel="noopener">BibTeX</a>{% endif %}
      {% if link.others %}{{ link.others }}{% endif %}
    </div>
  </div>
</article>
{% endfor %}
</div>
