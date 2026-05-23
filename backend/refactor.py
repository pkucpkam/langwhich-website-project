import os
import re
import shutil

app_dir = r"f:\Project\english-application\langwhich-website-project\backend\src\main\java\com\langwhich\app"

modules = ["admin", "auth", "exercise", "folder", "history", "lesson", "srs", "theory", "user", "vocabulary"]

def get_target_dir(module, file_name):
    if file_name.endswith("Controller.java"): return "controller"
    if file_name.endswith("Service.java") and "impl" not in file_name: return "service" # Note: we don't have impl yet
    if file_name.endswith("ServiceImpl.java"): return "service/impl"
    if file_name.endswith("Repository.java"): return "repository"
    if "Exception" in file_name: return "exception"
    if file_name.endswith("Mapper.java"): return "mapper"
    if "Request" in file_name: return "dto/request"
    if "Response" in file_name or "Dto" in file_name: return "dto/response"
    if file_name in ["StudyMode.java", "Role.java", "Difficulty.java", "AttemptStatus.java", "ExerciseType.java"]: return "entity"
    if file_name == "SrsAlgorithm.java": return "util"
    if file_name in ["ActiveAttemptResponse.java", "AdminExerciseSetDetailResponse.java", "AttemptAnswerReviewResponse.java", "AttemptReviewResponse.java", "ExerciseSetDetailResponse.java", "ExerciseSetResponse.java", "QuestionOptionResponse.java", "QuestionResponse.java", "QuestionReviewResponse.java", "SaveAnswerResponse.java", "SavedAnswerResponseDto.java", "StartAttemptResponse.java", "SubmitAttemptResponse.java"]: return "dto/response"
    if file_name in ["SaveAnswerRequest.java"]: return "dto/request"
    if "Strategy" in file_name: return "strategy" # For exercise module
    # Default fallback for models
    return "entity"

# Move exception to common/exception
exception_src = os.path.join(app_dir, "exception")
common_exception_dest = os.path.join(app_dir, "common", "exception")
if os.path.exists(exception_src):
    shutil.copytree(exception_src, common_exception_dest)
    shutil.rmtree(exception_src)

# Create modules dir
modules_dir = os.path.join(app_dir, "modules")
os.makedirs(modules_dir, exist_ok=True)

# File mappings (old_path -> new_path)
file_moves = {}
# Package mappings (old_fqn -> new_fqn)
import_mappings = {}

# Process domains
for mod in modules:
    src_mod_dir = os.path.join(app_dir, mod)
    if not os.path.exists(src_mod_dir): continue
    
    for root, dirs, files in os.walk(src_mod_dir):
        for f in files:
            if not f.endswith(".java"): continue
            old_path = os.path.join(root, f)
            
            # Special case for existing dto folder
            is_dto = "dto" in root
            is_exercise = mod == "exercise"
            
            if is_exercise:
                rel_dir = os.path.relpath(root, src_mod_dir).replace("\\", "/")
                if rel_dir == ".": 
                    sub = get_target_dir(mod, f)
                elif "dto" in rel_dir:
                    sub = "dto/request" if "Request" in f else "dto/response"
                else:
                    sub = rel_dir # already correctly categorized like controller, service, entity, strategy
            else:
                if is_dto:
                    sub = "dto/request" if "Request" in f else "dto/response"
                else:
                    sub = get_target_dir(mod, f)
            
            new_path = os.path.join(modules_dir, mod, os.path.normpath(sub), f)
            file_moves[old_path] = new_path
            
            # Calculate old and new FQN
            # old FQN: com.langwhich.app.{mod}.{f} or com.langwhich.app.{mod}.dto.{f}
            rel_old = os.path.relpath(old_path, app_dir).replace("\\", "/")
            old_pkg = "com.langwhich.app." + os.path.dirname(rel_old).replace("/", ".")
            old_fqn = old_pkg + "." + f[:-5]
            
            rel_new = os.path.relpath(new_path, app_dir).replace("\\", "/")
            new_pkg = "com.langwhich.app." + os.path.dirname(rel_new).replace("/", ".")
            new_fqn = new_pkg + "." + f[:-5]
            
            import_mappings[old_fqn] = new_fqn

# Exception import mappings
import_mappings["com.langwhich.app.exception.ConflictException"] = "com.langwhich.app.common.exception.ConflictException"
import_mappings["com.langwhich.app.exception.ForbiddenException"] = "com.langwhich.app.common.exception.ForbiddenException"
import_mappings["com.langwhich.app.exception.GlobalExceptionHandler"] = "com.langwhich.app.common.exception.GlobalExceptionHandler"
import_mappings["com.langwhich.app.exception.ResourceNotFoundException"] = "com.langwhich.app.common.exception.ResourceNotFoundException"

for root, dirs, files in os.walk(common_exception_dest):
    for f in files:
        if f.endswith(".java"):
            file_moves[os.path.join(root, f)] = os.path.join(root, f)

# Move files
for old_path, new_path in file_moves.items():
    if old_path != new_path:
        os.makedirs(os.path.dirname(new_path), exist_ok=True)
        shutil.copy2(old_path, new_path)

# Update contents
all_java_files = []
for root, dirs, files in os.walk(app_dir):
    for f in files:
        if f.endswith(".java"):
            # skip old dirs that we haven't deleted yet
            if os.path.relpath(root, app_dir).split(os.sep)[0] in modules:
                continue
            all_java_files.append(os.path.join(root, f))

for fpath in all_java_files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # update package
    rel = os.path.relpath(fpath, app_dir).replace("\\", "/")
    new_pkg = "com.langwhich.app." + os.path.dirname(rel).replace("/", ".")
    new_pkg = new_pkg.strip(".")
    content = re.sub(r"^package\s+com\.langwhich\.app[^;]*;", f"package {new_pkg};", content, flags=re.MULTILINE)
    
    # update imports
    for old_fqn, new_fqn in import_mappings.items():
        if old_fqn != new_fqn:
            # We want to replace whole words, but FQN are dots.
            content = re.sub(r"\b" + old_fqn.replace(".", r"\.") + r"\b", new_fqn, content)
            
    # add missing imports
    package_match = re.search(r"^package\s+([^;]+);", content, flags=re.MULTILINE)
    current_pkg = package_match.group(1).strip() if package_match else ""
    
    imports_to_add = set()
    for old_fqn, new_fqn in import_mappings.items():
        class_name = new_fqn.split(".")[-1]
        new_pkg_of_class = ".".join(new_fqn.split(".")[:-1])
        
        # If class name is used in the file, and it's not the same package, and not already imported
        if re.search(r"\b" + class_name + r"\b", content):
            if current_pkg != new_pkg_of_class:
                if f"import {new_fqn};" not in content:
                    imports_to_add.add(f"import {new_fqn};")
                    
    if imports_to_add:
        # Find the last import or the package declaration
        last_import_match = list(re.finditer(r"^import\s+[^;]+;", content, flags=re.MULTILINE))
        if last_import_match:
            insert_pos = last_import_match[-1].end()
            content = content[:insert_pos] + "\n" + "\n".join(imports_to_add) + content[insert_pos:]
        elif package_match:
            insert_pos = package_match.end()
            content = content[:insert_pos] + "\n\n" + "\n".join(imports_to_add) + content[insert_pos:]

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)

# Delete old module dirs
for mod in modules:
    mod_path = os.path.join(app_dir, mod)
    if os.path.exists(mod_path):
        shutil.rmtree(mod_path)
