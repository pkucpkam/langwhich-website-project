import os
import re

app_dir = r"f:\Project\english-application\langwhich-website-project\backend\src\main\java\com\langwhich\app"

for root, dirs, files in os.walk(app_dir):
    for f in files:
        if f.endswith(".java"):
            fpath = os.path.join(root, f)
            with open(fpath, "r", encoding="utf-8") as file:
                content = file.read()
            
            new_content = content
            
            # Wildcard replacements
            new_content = re.sub(r"import com\.langwhich\.app\.exercise\.dto\.\*;", 
                                 "import com.langwhich.app.modules.exercise.dto.request.*;\nimport com.langwhich.app.modules.exercise.dto.response.*;", 
                                 new_content)
            new_content = re.sub(r"import com\.langwhich\.app\.exercise\.entity\.\*;", 
                                 "import com.langwhich.app.modules.exercise.entity.*;", 
                                 new_content)
            new_content = re.sub(r"import com\.langwhich\.app\.exercise\.repository\.\*;", 
                                 "import com.langwhich.app.modules.exercise.repository.*;", 
                                 new_content)
            new_content = re.sub(r"import com\.langwhich\.app\.theory\.dto\.\*;", 
                                 "import com.langwhich.app.modules.theory.dto.request.*;\nimport com.langwhich.app.modules.theory.dto.response.*;", 
                                 new_content)
            
            if new_content != content:
                with open(fpath, "w", encoding="utf-8") as file:
                    file.write(new_content)
