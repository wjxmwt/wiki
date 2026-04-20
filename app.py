from os import path

from flask import Flask, render_template
from flask_frozen import Freezer

template_folder = path.abspath('./wiki')


app = Flask(__name__, template_folder=template_folder)
app.config['FREEZER_DESTINATION'] = 'public'
app.config['FREEZER_RELATIVE_URLS'] = True
app.config['FREEZER_IGNORE_MIMETYPE_WARNINGS'] = True
freezer = Freezer(app)

@app.cli.command()
def freeze():
    freezer.freeze()

@app.cli.command()
def serve():
    freezer.run()


# ==================== 路由 ====================

@app.route('/')
def home():
    return render_template('index.html',
        is_subpage=False,
        active_nav='Project',
        current_path='/')


@app.route('/wetlab/salicylic-acid/')
def wetlab_salicylic_acid():
    return render_template('pages/wetlab/salicylic-acid.html',
        is_subpage=True,
        active_nav='Wet-Lab',
        current_path='/wetlab/salicylic-acid')


# Main Function, Runs at http://0.0.0.0:5000
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
