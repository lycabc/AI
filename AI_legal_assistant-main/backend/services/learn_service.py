from models.leason_model import Leason
from fastapi.responses import JSONResponse


class LearnService:
    @staticmethod
    def leason_list(page, limit, leason_type, search_text, current_user, db):
        base_query = db.query(Leason)
        if leason_type:
            base_query = base_query.filter(
                Leason.leason_type == leason_type)
        if search_text:
            base_query = base_query.filter(
                Leason.title.contains(search_text))
        leason_list = base_query.offset(
            (page - 1) * limit).limit(limit).all()
        leason_list = [leason.as_dict() for leason in leason_list]
        total_count = base_query.count()
        return JSONResponse(content={
            "page": page,
            "limit": limit,
            "total": total_count,
            "leason_list": leason_list,
        })
