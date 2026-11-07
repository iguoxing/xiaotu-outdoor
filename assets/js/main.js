/* XIAOTU OUTDOOR — 站点渲染逻辑（数据来自 data.js） */
(function () {
  // ---------- 语言 ----------
  function getLang() {
    const u = new URLSearchParams(location.search).get("lang");
    if (u === "ar" || u === "en") { localStorage.setItem("xt_lang", u); return u; }
    return localStorage.getItem("xt_lang") || "en";
  }
  const lang = getLang();
  const T = I18N[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = T.dir;

  function switchLang() {
    const next = lang === "en" ? "ar" : "en";
    localStorage.setItem("xt_lang", next);
    const u = new URL(location.href);
    u.searchParams.set("lang", next);
    location.href = u.toString();
  }

  const imgOf = p => "assets/img/" + p.code + ".jpg";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function waLink(msg) {
    return "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(msg);
  }
  function quoteMsg(code) {
    if (lang === "ar") {
      return "مرحبًا XIAOTU OUTDOOR، أرغب في الحصول على عرض سعر.\nرمز الصنف: " + (code || "CAT-___") +
        "\nالكمية: \nاللون: \nميناء الوجهة: \nمتطلبات إضافية: ";
    }
    return "Hello XIAOTU OUTDOOR! I'd like a quotation.\nItem code: " + (code || "CAT-___") +
      "\nQuantity: \nColour: \nDestination port: \nAdditional requirements: ";
  }

  // ---------- 导航 / 页脚 ----------
  function mountChrome(active) {
    const nav = document.getElementById("nav");
    if (nav) {
      nav.innerHTML = '<div class="container">' +
        '<a class="logo" href="index.html">XIAOTU <span>OUTDOOR</span></a>' +
        '<div class="nav-links">' +
        navLink("products.html", T.nav_products, active === "products") +
        navLink("selected.html", T.nav_selected, active === "selected") +
        navLink("about.html", T.nav_about, active === "about") +
        navLink("contact.html", T.nav_contact, active === "contact") +
        '<button class="lang-btn" id="langBtn">' + T.lang_switch + "</button>" +
        "</div></div>";
      document.getElementById("langBtn").onclick = switchLang;
    }
    const foot = document.getElementById("foot");
    if (foot) {
      foot.innerHTML = '<div class="container">' +
        "<div><div class=\"flogo\">XIAOTU <span>OUTDOOR</span></div>" +
        "<small>" + SITE.company[lang] + "</small>" +
        "<small>" + T.footer_tag + " · " + SITE.location[lang] + "</small>" +
        "<small>" + T.lb_addr + ": " + SITE.address[lang] + "</small>" +
        "<small>" + T.lb_phone + ": " + SITE.phone + " · " + T.lb_wa + ": +852 9017 5471</small></div>" +
        '<div class="foot-links">' +
        '<a href="products.html">' + T.nav_products + "</a>" +
        '<a href="selected.html">' + T.nav_selected + "</a>" +
        '<a href="about.html">' + T.nav_about + "</a>" +
        '<a href="contact.html">' + T.nav_contact + "</a>" +
        "</div></div>";
    }
    const wa = document.getElementById("waFloat");
    if (wa) { wa.href = waLink(quoteMsg()); wa.textContent = "WhatsApp"; wa.target = "_blank"; }
  }
  function navLink(href, label, on) {
    return '<a href="' + href + '"' + (on ? ' class="active"' : "") + ">" + label + "</a>";
  }

  // ---------- 产品卡片 ----------
  function prodCard(p) {
    return '<a class="prod-card" href="product.html?code=' + p.code + '">' +
      '<div class="thumb"><img loading="lazy" src="' + imgOf(p) + '" alt="' + esc(p.name[lang]) + '"></div>' +
      '<div class="body"><span class="code">' + p.code + "</span>" +
      "<h3>" + esc(p.name[lang]) + "</h3>" +
      '<p class="tag">' + esc(p.tag[lang] || p.tag.en) + "</p>" +
      (p.selected ? '<span class="badge-sel">★ Selected</span>' : "") +
      '<span class="card-link">' + T.view + "</span>" +
      "</div></a>";
  }

  // ---------- 页面：首页 ----------
  function pageHome() {
    document.getElementById("heroTitle").textContent = T.hero_title;
    document.getElementById("heroSub").textContent = T.hero_sub;
    document.getElementById("heroKicker").textContent = T.hero_kicker;
    document.getElementById("heroCta").textContent = T.hero_cta;
    document.getElementById("heroCta2").textContent = T.hero_cta2;
    document.getElementById("catTitle").textContent = T.cat_title;
    document.getElementById("catSub").textContent = T.cat_sub;
    document.getElementById("selTitle").textContent = T.selected_title;
    document.getElementById("selSub").textContent = T.selected_sub;
    document.getElementById("whyTitle").textContent = T.why_title;
    document.getElementById("stepsTitle").textContent = T.steps_title;

    const counts = {};
    PRODUCTS.forEach(p => { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    document.getElementById("catGrid").innerHTML = Object.keys(CATS).map((k, i) =>
      '<a class="cat-card" href="products.html?cat=' + k + '">' +
      '<div class="num">' + counts[k] + "</div>" +
      "<h3>" + CATS[k][lang] + "</h3>" +
      "<small>" + CATS[k].range + "</small></a>").join("");

    document.getElementById("selGrid").innerHTML =
      PRODUCTS.filter(p => p.selected).map(prodCard).join("");

    const whys = [[T.why_1_t, T.why_1_d, "🏭"], [T.why_2_t, T.why_2_d, "📦"], [T.why_3_t, T.why_3_d, "⚡"]];
    document.getElementById("whyGrid").innerHTML = whys.map(w =>
      '<div class="why-card"><div class="ic">' + w[2] + "</div><h3>" + w[0] + "</h3><p>" + w[1] + "</p></div>").join("");

    document.getElementById("stepsGrid").innerHTML = [T.steps_1, T.steps_2, T.steps_3]
      .map(s => '<div class="step">' + s + "</div>").join("");
  }

  // ---------- 页面：产品列表 ----------
  function pageProducts() {
    const cur = new URLSearchParams(location.search).get("cat") || "all";
    const counts = {};
    PRODUCTS.forEach(p => { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    const bar = document.getElementById("filterBar");
    let html = '<button data-cat="all"' + (cur === "all" ? ' class="active"' : "") + ">" + T.all + " (" + PRODUCTS.length + ")</button>";
    Object.keys(CATS).forEach(k => {
      html += '<button data-cat="' + k + '"' + (cur === k ? ' class="active"' : "") + ">" + CATS[k][lang] + " (" + counts[k] + ")</button>";
    });
    bar.innerHTML = html;
    bar.querySelectorAll("button").forEach(b => b.onclick = () => {
      const u = new URL(location.href); u.searchParams.set("cat", b.dataset.cat); location.href = u.toString();
    });
    const list = cur === "all" ? PRODUCTS : PRODUCTS.filter(p => p.cat === cur);
    document.getElementById("prodGrid").innerHTML = list.map(prodCard).join("");
    document.getElementById("skuNote").textContent = T.sku_note;
  }

  // ---------- 页面：产品详情 ----------
  function pageProduct() {
    const code = new URLSearchParams(location.search).get("code") || "CAT-001";
    const p = PRODUCTS.find(x => x.code === code) || PRODUCTS[0];
    document.title = p.name.en + " | " + SITE.brand;
    document.getElementById("crumbCat").textContent = CATS[p.cat][lang];
    document.getElementById("crumbCat").href = "products.html?cat=" + p.cat;
    document.getElementById("crumbHome").textContent = T.home;
    document.getElementById("pImg").src = imgOf(p);
    document.getElementById("pImg").alt = p.name[lang];
    document.getElementById("pCode").textContent = p.code + (p.selected ? "  ·  ★ Selected" : "");
    document.getElementById("pName").textContent = p.name[lang];
    document.getElementById("pTag").textContent = p.tag[lang] || p.tag.en;
    document.getElementById("specTitle").textContent = T.spec_title;
    document.getElementById("specRows").innerHTML = p.specs.map(s =>
      "<tr><th>" + SPEC_LABELS[s[0]][lang] + "</th><td>" + esc(s[1]) + "</td></tr>").join("");
    document.getElementById("quoteText").textContent = T.cta_quote;
    const wb = document.getElementById("waBtn");
    wb.textContent = T.wa_button;
    wb.href = waLink(quoteMsg(p.code));
    document.getElementById("relatedTitle").textContent = T.related_title;
    document.getElementById("relatedGrid").innerHTML =
      PRODUCTS.filter(x => x.cat === p.cat && x.code !== p.code).slice(0, 4).map(prodCard).join("");
  }

  // ---------- 页面：精选 ----------
  function pageSelected() {
    document.getElementById("selTitle").textContent = T.selected_title;
    document.getElementById("selSub").textContent = T.selected_sub;
    document.getElementById("selGrid").innerHTML =
      PRODUCTS.filter(p => p.selected).map(prodCard).join("");
  }

  // ---------- 页面：关于 ----------
  function pageAbout() {
    document.getElementById("aboutTitle").textContent = T.about_title;
    document.getElementById("aboutBody").textContent = T.about_body;
    document.getElementById("aboutFlow").textContent = T.about_flow;
    const counts = {};
    PRODUCTS.forEach(p => { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    document.getElementById("catGrid").innerHTML = Object.keys(CATS).map(k =>
      '<a class="cat-card" href="products.html?cat=' + k + '">' +
      '<div class="num">' + counts[k] + "</div><h3>" + CATS[k][lang] + "</h3><small>" + CATS[k].range + "</small></a>").join("");
  }

  // ---------- 页面：联系 ----------
  function pageContact() {
    document.getElementById("cKicker").textContent = T.contact_kicker;
    document.getElementById("cHead").textContent = T.contact_head;
    document.getElementById("cSub").textContent = T.contact_sub;
    document.getElementById("fieldList").innerHTML =
      [T.f_code, T.f_qty, T.f_colour, T.f_port, T.f_extra].map((f, i) =>
        "<li><b>0" + (i + 1) + "</b>" + f + "</li>").join("");
    const co = document.getElementById("coInfo");
    if (co) {
      co.innerHTML = '<h3 style="color:var(--green-dark);margin-bottom:10px">' + T.info_title + "</h3>" +
        '<ul class="field-list">' +
        "<li><b>" + T.lb_wa + "</b><a href='" + waLink(quoteMsg()) + "' target='_blank' rel='noopener' style='color:var(--green);font-weight:700'>+852 9017 5471</a></li>" +
        "<li><b>" + T.lb_phone + "</b><a href='tel:+8618831647564' style='color:var(--green);font-weight:700'>" + SITE.phone + "</a></li>" +
        "<li><b>" + T.lb_addr + "</b>" + SITE.company[lang] + "<br><span style='color:var(--muted);font-size:13.5px'>" + SITE.address[lang] + "</span></li>" +
        "</ul>";
    }
    const labels = ["f_code", "f_qty", "f_colour", "f_port", "f_extra"];
    labels.forEach(k => { document.getElementById("l_" + k).textContent = T[k]; });
    const sel = document.getElementById("in_code");
    sel.innerHTML = '<option value="">—</option>' +
      PRODUCTS.map(p => '<option value="' + p.code + '">' + p.code + " · " + esc(p.name[lang]) + "</option>").join("");
    document.getElementById("sendBtn").textContent = T.f_send + " · WhatsApp";
    document.getElementById("sendBtn").onclick = () => {
      const v = id => document.getElementById(id).value.trim();
      let msg;
      if (lang === "ar") {
        msg = "مرحبًا XIAOTU OUTDOOR، أرغب في الحصول على عرض سعر.\n" +
          "رمز الصنف: " + v("in_code") + "\nالكمية: " + v("in_qty") + "\nاللون: " + v("in_colour") +
          "\nميناء الوجهة: " + v("in_port") + "\nمتطلبات إضافية: " + v("in_extra");
      } else {
        msg = "Hello XIAOTU OUTDOOR! I'd like a quotation.\n" +
          "Item code: " + v("in_code") + "\nQuantity: " + v("in_qty") + "\nColour: " + v("in_colour") +
          "\nDestination port: " + v("in_port") + "\nAdditional requirements: " + v("in_extra");
      }
      window.open(waLink(msg), "_blank");
    };
  }

  // ---------- 启动 ----------
  const page = document.body.dataset.page;
  mountChrome(page);
  if (page === "home") pageHome();
  if (page === "products") pageProducts();
  if (page === "product") pageProduct();
  if (page === "selected") pageSelected();
  if (page === "about") pageAbout();
  if (page === "contact") pageContact();
})();
