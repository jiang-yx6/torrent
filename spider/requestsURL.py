from lxml import etree
import requests
import json
def get_torrent_url(url,proxy_port):
    headers= {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    }
    proxies = {
        "http": f"http://127.0.0.1:{proxy_port}",
        "https": f"http://127.0.0.1:{proxy_port}",
    }
    response = requests.get(url,headers=headers,proxies=proxies)
    
    with open("dmhy.html","w",encoding="utf-8") as f:
        f.write(response.text)
    return response.text

def get_torrent_info():
    with open("dmhy.html","r",encoding="utf-8") as f:
        html = f.read()
    tree = etree.HTML(html)
    tbody = tree.xpath("//*[@id='topic_list']/tbody")
    tr_items = tbody[0].xpath("./tr")
    count = 0
    results = []
    for item in tr_items:    
        id = count
        title = item.xpath("./td[3]/a/text()")
        publisher = item.xpath("./td[9]/a/text()")
        url = item.xpath("./td[4]/a[1]/@href")
        center = item.xpath("./td[2]/a/font/text()")
        if(center and center[0] == "動畫"):
            results.append({
                "id": id,
                "title": title[0].strip(),
                "publisher": publisher[0],
                "url": url[0],
                "center": center[0]
            })
            count += 1
    with open("results.json","w",encoding="utf-8") as f:
        f.write(json.dumps(results,ensure_ascii=False,indent=4))
    return results

if __name__ == "__main__":

    get_torrent_url("https://www.dmhy.org/",56659)
    get_torrent_info()