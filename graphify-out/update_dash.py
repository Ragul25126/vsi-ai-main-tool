from pathlib import Path

file_path = Path("src/features/visibility/components/DashboardClientView.tsx")
content = file_path.read_text(encoding="utf-8")

start_marker = "      ) : (\n        <>\n          {/* ── 1. Dashboard Hero Section ── */}"
end_marker = "        </>\n      )}"

replacement = """      ) : (
        <ExecutiveDashboardView
          clientList={clientList}
          rawResults={rawResults}
          activeClient={activeClient}
          onSearchKeyword={(kw) => {
            setSearchQuery(kw);
            router.push(
              `/dashboard?q=${encodeURIComponent(kw)}&lang=${encodeURIComponent(language)}&loc=${encodeURIComponent(location)}&service=${encodeURIComponent(selectedService)}`
            );
          }}
        />
      )}"""

if start_marker in content and end_marker in content:
    start_pos = content.find(start_marker)
    end_pos = content.find(end_marker, start_pos) + len(end_marker)
    new_content = content[:start_pos] + replacement + content[end_pos:]
    file_path.write_text(new_content, encoding="utf-8")
    print("DashboardClientView successfully updated with ExecutiveDashboardView!")
else:
    print("Markers not found, start:", start_marker in content, "end:", end_marker in content)
