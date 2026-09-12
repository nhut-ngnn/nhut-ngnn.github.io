# frozen_string_literal: true

# Builds a co-authorship graph from _bibliography/papers.bib at build time and
# exposes it as site.data["coauthor_graph"].
#
#   site.data["coauthor_graph"] = {
#     "ego"     => "Nhut Minh Nguyen",
#     "nodes"   => [{ "id", "name", "short", "papers", "url", "first_year", "last_year" }, ...],
#     "links"   => [{ "source", "target", "weight" }, ...],
#     "papers"  => [{ "key", "title", "year", "venue", "authors" => [id, ...] }, ...]
#   }
#
# The parser is deliberately dependency-free (no bibtex-ruby) so that it behaves
# identically whether or not jekyll-scholar's internals change. It understands the
# two author spellings used in this bibliography:
#
#   author = {Nguyen, Nhut Minh and Le, Thu Thuy}      # "Last, First"
#   author = {Nhut Minh Nguyen and Thu Thuy Le}        # "First Last"

module CoauthorGraph
  BIB_PATH = "_bibliography/papers.bib"

  module_function

  # --- tiny BibTeX reader -----------------------------------------------------

  # Returns the contents of a brace-balanced field, or nil.
  def field(entry, name)
    m = entry.match(/#{name}\s*=\s*\{/im)
    return simple_field(entry, name) unless m

    i = m.end(0)
    depth = 1
    while i < entry.length && depth.positive?
      case entry[i]
      when "{" then depth += 1
      when "}" then depth -= 1
      end
      i += 1
    end
    entry[m.end(0)...(i - 1)]
  end

  # year = 2026 / abbr = EAAI (unbraced values)
  def simple_field(entry, name)
    m = entry.match(/#{name}\s*=\s*([^,{}\n]+)/im)
    m && m[1].strip.delete('"')
  end

  def entries(source)
    # Split on "@type{" at the start of a line; keep each chunk whole.
    source.split(/^@/).drop(1).map { |chunk| "@#{chunk}" }
  end

  # --- name handling ----------------------------------------------------------

  def clean(str)
    str.to_s
       .gsub(/[{}]/, "")            # Phuong{-}Nam -> Phuong-Nam
       .gsub(/\\[a-zA-Z]+\s*/, "")  # drop stray latex commands
       .gsub(/\s+/, " ")
       .strip
  end

  # "Nguyen, Nhut Minh" and "Nhut Minh Nguyen" both -> ["Nhut Minh", "Nguyen"]
  def split_name(raw)
    name = clean(raw)
    return nil if name.empty?

    if name.include?(",")
      last, first = name.split(",", 2)
      [clean(first), clean(last)]
    else
      parts = name.split(" ")
      return [nil, parts.first] if parts.length == 1

      [parts[0..-2].join(" "), parts[-1]]
    end
  end

  def display_name(first, last)
    [first, last].compact.reject(&:empty?).join(" ")
  end

  # "Nhut Minh Nguyen" -> "N. M. Nguyen"
  def short_name(first, last)
    return last.to_s if first.nil? || first.empty?

    initials = first.split(/[\s\-]+/).reject(&:empty?).map { |p| "#{p[0].upcase}." }.join(" ")
    "#{initials} #{last}"
  end

  def slug(name)
    name.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/\A-|-\z/, "")
  end

  def authors_of(entry)
    raw = field(entry, "author")
    return [] if raw.nil?

    raw.split(/\s+and\s+/i).filter_map { |part| split_name(part) }
  end

  # --- co-author profile links from _data/coauthors.yml -----------------------

  def profile_url(coauthors, first, last)
    return nil unless coauthors.is_a?(Hash)

    bucket = coauthors[last.to_s.downcase]
    return nil unless bucket.is_a?(Array)

    match = bucket.find do |person|
      names = person["firstname"]
      names.is_a?(Array) && names.any? { |n| first.to_s.downcase.start_with?(n.to_s.downcase) }
    end
    match && match["url"]
  end

  # --- ego detection ----------------------------------------------------------

  def ego?(first, last, site)
    scholar = site.config["scholar"] || {}
    last_names = Array(scholar["last_name"]).map { |n| n.to_s.downcase }
    first_names = Array(scholar["first_name"]).flat_map { |n| n.to_s.split(",") }.map { |n| n.strip.downcase }
    return false unless last_names.include?(last.to_s.downcase)

    f = first.to_s.downcase
    first_names.any? { |n| !n.empty? && f == n }
  end
end

module Jekyll
  class CoauthorGraphGenerator < Generator
    safe true
    priority :high

    def generate(site)
      path = File.join(site.source, CoauthorGraph::BIB_PATH)
      return unless File.exist?(path)

      source = File.read(path, encoding: "utf-8")
      coauthors = site.data["coauthors"]

      nodes = {}   # id => node hash
      pairs = Hash.new(0)
      papers = []
      ego_id = nil

      CoauthorGraph.entries(source).each do |entry|
        people = CoauthorGraph.authors_of(entry)
        next if people.empty?

        title = CoauthorGraph.clean(CoauthorGraph.field(entry, "title"))
        year  = CoauthorGraph.field(entry, "year").to_s[/\d{4}/]
        venue = CoauthorGraph.clean(CoauthorGraph.field(entry, "abbr"))
        key   = entry[/\A@\w+\s*\{\s*([^,]+),/, 1].to_s.strip

        ids = people.map do |(first, last)|
          name = CoauthorGraph.display_name(first, last)
          id = CoauthorGraph.slug(name)
          is_ego = CoauthorGraph.ego?(first, last, site)
          ego_id ||= id if is_ego

          node = nodes[id] ||= {
            "id" => id,
            "name" => name,
            "short" => CoauthorGraph.short_name(first, last),
            "last" => last.to_s,
            "papers" => 0,
            "url" => CoauthorGraph.profile_url(coauthors, first, last),
            "ego" => is_ego,
            "first_year" => nil,
            "last_year" => nil
          }
          node["papers"] += 1
          if year
            y = year.to_i
            node["first_year"] = y if node["first_year"].nil? || y < node["first_year"]
            node["last_year"] = y if node["last_year"].nil? || y > node["last_year"]
          end
          id
        end

        ids.combination(2) { |a, b| pairs[[a, b].sort] += 1 }

        papers << {
          "key" => key,
          "title" => title,
          "year" => year && year.to_i,
          "venue" => venue,
          "authors" => ids
        }
      end

      return if nodes.empty?

      links = pairs.map do |(a, b), weight|
        { "source" => a, "target" => b, "weight" => weight }
      end

      ordered = nodes.values.sort_by { |n| [n["ego"] ? 0 : 1, -n["papers"], n["name"]] }

      site.data["coauthor_graph"] = {
        "ego" => ego_id,
        "generated" => Time.now.utc.strftime("%Y-%m-%d"),
        "paper_count" => papers.length,
        "author_count" => ordered.length - (ego_id ? 1 : 0),
        "nodes" => ordered,
        "links" => links.sort_by { |l| -l["weight"] },
        "papers" => papers.sort_by { |p| [-(p["year"] || 0), p["title"]] }
      }
    end
  end
end
