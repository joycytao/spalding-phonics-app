from playwright.sync_api import sync_playwright

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto("http://127.0.0.1:4173")
    page.wait_for_load_state("networkidle")

    page.get_by_role("button", name="Start Practice").click()
    page.get_by_role("button", name="Phonograms 1 to 26").click()
    page.get_by_role("button", name="Start practice").click()
    assert page.get_by_text("PHONOGRAM 1").is_visible()
    assert page.get_by_text("a", exact=True).is_visible()

    page.get_by_role("button", name="Home").click()
    page.get_by_role("button", name="Start Exam").click()
    page.get_by_role("button", name="Phonograms 1 to 26").click()
    page.get_by_role("button", name="Start exam").click()
    assert page.get_by_text("?", exact=True).is_visible()
    assert not page.get_by_text("a", exact=True).is_visible()

    page.screenshot(path="/tmp/phonograms-home-exam.png", full_page=True)
    browser.close()
