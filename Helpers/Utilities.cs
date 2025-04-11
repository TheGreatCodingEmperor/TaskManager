using System.Linq.Expressions;
using EntityFramework.DynamicLinq;

public static class IQueryableExtensions
{
    public static IQueryable<T> ApplySorting<T>(this IQueryable<T> query, string? orderColumn, bool? descending)
    {
        if (!string.IsNullOrEmpty(orderColumn))
        {
            var sorting = $"x.{orderColumn}";
            query = descending == true?query.OrderByDescending(x => sorting) :query.OrderBy(x => sorting);
        }
        return query;
    }

    public static IQueryable<T> ApplyPaging<T>(this IQueryable<T> query, int page, int pageSize)
    {
        return query.Skip((page - 1) * pageSize).Take(pageSize);
    }
    /// <summary>
    /// 根據提供的條件值和過濾條件，動態地對 IQueryable 進行篩選。
    /// </summary>
    /// <typeparam name="T">資料來源的類型。</typeparam>
    /// <typeparam name="TValue">條件值的類型。</typeparam>
    /// <param name="source">要篩選的 IQueryable 資料來源。</param>
    /// <param name="conditionValue">用於篩選的條件值。</param>
    /// <param name="predicate">定義篩選條件的表達式。</param>
    /// <returns>篩選後的 IQueryable 資料來源。</returns>
    public static IQueryable<T> WhereIf<T, TValue>(
        this IQueryable<T> source,
        TValue conditionValue,
        Expression<Func<T, bool>> predicate)
    {
        if (IsConditionValid(conditionValue))
        {
            return source.Where(predicate);
        }

        return source;
    }

    /// <summary>
    /// 判斷條件值是否有效。
    /// </summary>
    /// <typeparam name="TValue">條件值的類型。</typeparam>
    /// <param name="value">要檢查的條件值。</param>
    /// <returns>如果條件值有效，則為 true；否則為 false。</returns>
    private static bool IsConditionValid<TValue>(TValue value)
    {
        if (value == null)
            return false;

        if (value is string str)
            return !string.IsNullOrWhiteSpace(str);

        return true;
    }
}

public class QueryParameters
{
    public string? OrderColumn { get; set; }
    public bool? OrderDescending { get; set; } = false;
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}