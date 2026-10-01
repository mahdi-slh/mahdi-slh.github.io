<h2 id="publications">Publications</h2>

<div class="pubcards">
{% for link in site.data.publications.main %}
<article class="pubcard">
  {% if link.image %}<a class="pubcard-thumb" href="{{ link.pdf | default: link.page | default: link.code }}" target="_blank" rel="noopener"><img src="{{ link.image }}" alt="{{ link.title }}" loading="lazy"></a>{% endif %}
  <div class="pubcard-text">
    <div class="pubcard-badges">
      {% if link.conference_short %}<span class="pubcard-venue">{{ link.conference_short }} {{ link.conference | split: ", " | last | slice: -4, 4 }}</span>{% endif %}
      {% if link.notes %}<span class="pubcard-venue alt">{{ link.notes }}</span>{% endif %}
    </div>
    <h3><a href="{{ link.pdf | default: link.page | default: link.code }}" target="_blank" rel="noopener">{{ link.title }}</a></h3>
    <div class="pubcard-authors" title="{{ link.authors }}">{{ link.authors | replace: "Saleh, Mahdi", "<b>Saleh, Mahdi</b>" }}</div>
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
